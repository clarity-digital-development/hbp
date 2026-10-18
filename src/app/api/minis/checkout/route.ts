import { NextRequest, NextResponse } from "next/server";
import { CHECKOUT_BRANDING, getStripe, isStripeConfigured } from "@/lib/stripe";
import { isDbConfigured } from "@/lib/db";
import {
  CHRISTMAS_MINIS as MINI,
  addOnsSummary,
  cleanAddOns,
  isMiniTime,
  miniSlotIsPast,
  miniTotals,
} from "@/lib/minis";
import { attachCheckoutToHold, dropHold, holdMiniSlot } from "@/lib/mini-slots";
import { formatSessionDate } from "@/lib/payments";
import { trustedOrigin, visitorKey } from "@/lib/site";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface MiniCheckoutBody {
  time: string;
  fullName: string;
  phone: string;
  email: string;
  people: number;
  children: "Yes" | "No";
  requests?: string;
  addOns?: string[];
  payInFull: boolean | null;
}

/**
 * Books a Christmas mini. The slot is held before Checkout starts, so two
 * families can't pay for the same time; the webhook turns the paid session
 * into a booking exactly like a regular deposit.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured() || !isDbConfigured()) {
    return NextResponse.json({ error: "Booking isn't available right now." }, { status: 503 });
  }

  let body: MiniCheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const time = String(body.time || "");
  const fullName = String(body.fullName || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const people = Number(body.people);
  const children = body.children === "Yes" || body.children === "No" ? body.children : null;
  const requests = String(body.requests || "").trim();
  const addOns = cleanAddOns(body.addOns);
  const payInFull = body.payInFull;
  const now = new Date();

  if (!isMiniTime(time)) return NextResponse.json({ error: "Please choose a time." }, { status: 400 });
  if (miniSlotIsPast(time, now)) {
    return NextResponse.json({ error: "That time has already passed." }, { status: 410 });
  }
  if (!fullName || !phone) return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (!Number.isInteger(people) || people < 1 || people > 30) {
    return NextResponse.json({ error: "Please say how many people will be in the photos." }, { status: 400 });
  }
  if (!children) return NextResponse.json({ error: "Please say whether any children are coming." }, { status: 400 });
  if (typeof payInFull !== "boolean") {
    return NextResponse.json({ error: "Please choose how you'd like to pay." }, { status: 400 });
  }

  const hold = await holdMiniSlot(time, visitorKey(req), email, now);
  if (!hold.ok && hold.reason === "limit") {
    return NextResponse.json(
      { error: "You already have times held in checkout. Finish or cancel those first, then try again." },
      { status: 429 }
    );
  }
  if (!hold.ok) {
    return NextResponse.json(
      { error: `Sorry, ${time} was just taken. Please choose another time.`, taken: true },
      { status: 409 }
    );
  }
  const { releaseKey } = hold;

  const { total, dueNow, balance } = miniTotals(payInFull, addOns);
  const when = `${formatSessionDate(MINI.date)} at ${time}`;
  // Metadata values are capped at 500 characters by Stripe.
  const notes = [`People: ${people} · Children: ${children}`, requests && `Requests: ${requests}`]
    .filter(Boolean)
    .join("\n")
    .slice(0, 480);

  const lineItems = [
    {
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: (payInFull ? MINI.price : MINI.deposit) * 100,
        product_data: {
          name: payInFull ? "Christmas Mini Session" : "Christmas Mini Session — deposit",
          description: `${when} · ${MINI.location}`,
        },
      },
    },
    ...MINI.addOns
      .filter((a) => addOns.includes(a.id))
      .map((a) => ({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: a.price * 100,
          product_data: { name: a.label, description: a.detail },
        },
      })),
  ];

  const origin = trustedOrigin(req);

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      customer_email: email,
      line_items: lineItems,
      // Stripe's minimum. The slot hold outlasts it, so an unpaid session
      // can never be completed after its hold has gone.
      expires_at: Math.floor(now.getTime() / 1000) + 30 * 60,
      payment_intent_data: {
        description: `Christmas Mini — ${time} — ${fullName}`,
        receipt_email: email,
      },
      // Same keys as a regular deposit, so the webhook books it the same way.
      metadata: {
        purpose: "mini",
        fullName,
        phone,
        social: "",
        sessionType: MINI.sessionType,
        packageName: MINI.packageName,
        date: MINI.date,
        time,
        notes,
        prints: "",
        addOns: addOnsSummary(addOns),
        sessionTotal: String(total),
        deposit: String(dueNow),
        balance: String(balance),
      },
      branding_settings: CHECKOUT_BRANDING,
      success_url: `${origin}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/christmas-minis?canceled=1&hold=${releaseKey}`,
    });
    await attachCheckoutToHold(releaseKey, session.id);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Christmas mini checkout error:", err);
    await dropHold(releaseKey);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
