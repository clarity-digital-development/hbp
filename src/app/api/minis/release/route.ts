import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { isDbConfigured } from "@/lib/db";
import { dropHold, findHold } from "@/lib/mini-slots";

export const runtime = "nodejs";

/**
 * Frees a slot when its client backs out of Checkout. The Checkout session is
 * expired first: releasing the slot while that session could still be paid
 * (a browser Back into it) would let two families book the same time.
 */
export async function POST(req: NextRequest) {
  if (!isDbConfigured()) return NextResponse.json({ ok: true });

  let hold = "";
  try {
    ({ hold } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const row = hold ? await findHold(String(hold)) : null;
  if (!row) return NextResponse.json({ ok: true }); // already released or expired

  if (row.stripeSessionId && isStripeConfigured()) {
    const stripe = getStripe();
    try {
      let session = await stripe.checkout.sessions.retrieve(row.stripeSessionId);
      if (session.status === "open") {
        try {
          session = await stripe.checkout.sessions.expire(session.id);
        } catch {
          // A second release (a double tap) may have expired it a moment ago.
          session = await stripe.checkout.sessions.retrieve(session.id);
        }
      }
      if (session.status === "complete") return NextResponse.json({ ok: true }); // they paid after all
      if (session.status !== "expired") throw new Error(`Checkout session is ${session.status}`);
    } catch (err) {
      // Can't confirm the session is dead, so keep the hold; it lapses on its own.
      console.error("Could not expire the mini checkout session:", err);
      return NextResponse.json({ ok: false }, { status: 502 });
    }
  }

  await dropHold(row.releaseKey);
  return NextResponse.json({ ok: true });
}
