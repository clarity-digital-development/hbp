import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { CHRISTMAS_MINIS } from "@/lib/minis";

// Server-side only (Node crypto, database): never imported by a client component.

/**
 * How long a slot stays reserved for someone in checkout. Longer than the
 * 30-minute Checkout expiry set in the checkout route, so a hold can't lapse
 * while its session can still be paid.
 */
export const HOLD_MINUTES = 35;

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
 * Reserves a slot for one checkout. Returns the hold's release key, or null
 * when the slot is booked or someone else is already paying for it.
 *
 * No transaction needed: the slot is the hold's primary key, so of two
 * people racing for the same free slot, exactly one insert succeeds.
 */
export async function holdMiniSlot(time: string, now = new Date()): Promise<string | null> {
  const booked = await prisma.booking.count({
    where: {
      packageName: CHRISTMAS_MINIS.packageName,
      sessionDate: CHRISTMAS_MINIS.date,
      sessionTime: time,
      status: { not: "cancelled" },
    },
  });
  if (booked > 0) return null;

  const slotKey = keyFor(time);
  await prisma.slotHold.deleteMany({ where: { slotKey, expiresAt: { lte: now } } });

  const releaseKey = randomBytes(18).toString("base64url");
  try {
    await prisma.slotHold.create({
      data: { slotKey, releaseKey, expiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000) },
    });
    return releaseKey;
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") return null; // someone else is in checkout
    throw err;
  }
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
