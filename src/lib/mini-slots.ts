import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { CHRISTMAS_MINIS } from "@/lib/minis";

// Server-side only (Node crypto, database): never imported by a client component.

/**
 * How long a slot stays reserved for someone in checkout. Longer than the
 * 30-minute Checkout expiry set in the checkout route, so a hold can't lapse
 * while its session can still be paid.
 */
export const HOLD_MINUTES = 35;

/**
 * Live holds one visitor may have at once. Without a cap, one person could
 * keep all six slots tied up by starting checkout over and over. Two still
 * lets a family book two times, or two people share a connection.
 */
export const HOLDS_PER_VISITOR = 2;

export type HoldResult = { ok: true; releaseKey: string } | { ok: false; reason: "taken" | "limit" };

const keyFor = (time: string) => `christmas-minis:${CHRISTMAS_MINIS.date}:${time}`;

/** Paid bookings and live holds: the times nobody else can book. */
export async function takenMiniTimes(now = new Date()): Promise<Set<string>> {
  const [booked, held] = await Promise.all([
    prisma.booking.findMany({
      where: {
        packageName: CHRISTMAS_MINIS.packageName,
        sessionDate: CHRISTMAS_MINIS.date,
        status: { not: "cancelled" },
      },
      select: { sessionTime: true },
    }),
    prisma.slotHold.findMany({
      where: { slotKey: { startsWith: keyFor("") }, expiresAt: { gt: now } },
      select: { slotKey: true },
    }),
  ]);
  return new Set([...booked.map((b) => b.sessionTime), ...held.map((h) => h.slotKey.slice(keyFor("").length))]);
}

/**
 * Reserves a slot for one checkout: "taken" when it is booked or someone else
 * is paying for it, "limit" when this visitor already holds too many.
 *
 * `visitor` identifies who is asking, for the cap (see visitorKey in
 * lib/site); `owner` is the browser's private cookie token.
 *
 * No transaction needed: the slot is the hold's primary key, so of two
 * people racing for the same free slot, exactly one insert succeeds.
 */
export async function holdMiniSlot(
  time: string,
  visitor: string,
  owner: string,
  now = new Date()
): Promise<HoldResult> {
  const booked = await prisma.booking.count({
    where: {
      packageName: CHRISTMAS_MINIS.packageName,
      sessionDate: CHRISTMAS_MINIS.date,
      sessionTime: time,
      status: { not: "cancelled" },
    },
  });
  if (booked > 0) return { ok: false, reason: "taken" };

  const slotKey = keyFor(time);
  const liveElsewhere = await prisma.slotHold.count({
    where: { ip: visitor, expiresAt: { gt: now }, slotKey: { not: slotKey } },
  });
  if (liveElsewhere >= HOLDS_PER_VISITOR) return { ok: false, reason: "limit" };

  await prisma.slotHold.deleteMany({ where: { slotKey, expiresAt: { lte: now } } });

  // Their own hold on this time (they closed the Stripe tab and came back):
  // end that checkout and let them start again, rather than telling them
  // their own time is taken for the next half hour. "Their own" is proven
  // only by the private cookie from that browser: an IP or an email can be
  // shared or known by someone else, who must never cancel this checkout.
  const existing = await prisma.slotHold.findUnique({ where: { slotKey } });
  if (existing?.owner && existing.owner === owner && existing.stripeSessionId) {
    if ((await releaseHold(existing)) !== "released") return { ok: false, reason: "taken" };
  }

  const releaseKey = randomBytes(18).toString("base64url");
  try {
    await prisma.slotHold.create({
      data: { slotKey, releaseKey, ip: visitor, owner, expiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000) },
    });
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") return { ok: false, reason: "taken" }; // someone else is in checkout
    throw err;
  }

  // The check above can't stop simultaneous requests from one visitor all
  // passing it, so count again now that this hold exists and back out if over.
  const live = await prisma.slotHold.count({ where: { ip: visitor, expiresAt: { gt: now } } });
  if (live > HOLDS_PER_VISITOR) {
    await dropHold(releaseKey);
    return { ok: false, reason: "limit" };
  }
  return { ok: true, releaseKey };
}

export async function attachCheckoutToHold(releaseKey: string, stripeSessionId: string) {
  await prisma.slotHold.updateMany({ where: { releaseKey }, data: { stripeSessionId } });
}

export async function findHold(releaseKey: string) {
  return prisma.slotHold.findFirst({ where: { releaseKey } });
}

export async function dropHold(releaseKey: string) {
  await prisma.slotHold.deleteMany({ where: { releaseKey } });
}

/**
 * Ends a hold. Its Checkout session is expired first: freeing the slot while
 * that session could still be paid (a browser Back into it) would let two
 * families book the same time.
 *
 * "paid" means the session completed, so the slot stays theirs; "kept" means
 * Stripe couldn't confirm the session is dead, so the hold lapses on its own.
 * Throws if Stripe can't be reached.
 */
export async function releaseHold(row: {
  releaseKey: string;
  stripeSessionId: string | null;
}): Promise<"released" | "paid" | "kept"> {
  if (row.stripeSessionId && isStripeConfigured()) {
    const stripe = getStripe();
    let session = await stripe.checkout.sessions.retrieve(row.stripeSessionId);
    if (session.status === "open") {
      try {
        session = await stripe.checkout.sessions.expire(session.id);
      } catch {
        // A second release (a double tap) may have expired it a moment ago.
        session = await stripe.checkout.sessions.retrieve(session.id);
      }
    }
    if (session.status === "complete") return "paid";
    if (session.status !== "expired") return "kept";
  }
  await dropHold(row.releaseKey);
  return "released";
}
