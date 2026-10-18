import { NextRequest, NextResponse } from "next/server";
import { CHECKOUT_BRANDING, getStripe, isStripeConfigured } from "@/lib/stripe";
import { prisma, isDbConfigured } from "@/lib/db";
import { amountDueCents, formatSessionDate, validateTip } from "@/lib/payments";

export const runtime = "nodejs";

/**
 * Starts the Stripe Checkout for a final payment. The amount owed always comes
 * from the database — the browser only proposes a tip, which is validated
 * here — so a tampered request can change the tip but never the balance.
 */
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  if (!isDbConfigured() || !isStripeConfigured()) {
    return NextResponse.json({ error: "Payments aren't available right now." }, { status: 503 });
  }

  const booking = await prisma.booking.findUnique({ where: { paymentToken: params.token } });
  if (!booking) return NextResponse.json({ error: "Payment link not found." }, { status: 404 });

  const dueCents = amountDueCents(booking);
  if (dueCents <= 0) {
    return NextResponse.json({ error: "This balance has already been paid. Thank you!" }, { status: 409 });
  }
  // Stripe's minimum charge.
  if (dueCents < 50) {
    return NextResponse.json({ error: "This balance is too small to pay online." }, { status: 400 });
  }

  let body: { tipCents?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* no body → no tip */
  }
  const tip = validateTip(booking, body.tipCents ?? 0);
  if (!tip.ok) return NextResponse.json({ error: tip.error }, { status: 400 });

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const isSession = booking.kind === "session";

  const lineItems = [
    {
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: dueCents,
        product_data: {
          name: isSession ? `${booking.sessionType} — remaining balance` : booking.sessionType,
          description:
            [booking.packageName, formatSessionDate(booking.sessionDate)].filter(Boolean).join(" · ") || undefined,
        },
      },
    },
  ];
  if (tip.tipCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: tip.tipCents,
        product_data: { name: "Gratuity", description: "Thank you so much!" },
      },
    });
  }

  // Tagged so the webhook routes it as a final payment rather than reading it
  // as a new deposit booking.
  const metadata = {
    purpose: "final-payment",
    bookingId: booking.id,
    dueCents: String(dueCents),
    tipCents: String(tip.tipCents),
  };

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      // Keep the payment on the client's existing Stripe customer when there is one.
      ...(booking.stripeCustomerId
        ? { customer: booking.stripeCustomerId }
        : { customer_creation: "always" as const, ...(booking.email ? { customer_email: booking.email } : {}) }),
      line_items: lineItems,
      payment_intent_data: {
        description: `Final payment — ${booking.fullName}`,
        metadata,
        // Stripe sends its own itemised receipt when this is set in live mode.
        ...(booking.email ? { receipt_email: booking.email } : {}),
      },
      metadata,
      branding_settings: CHECKOUT_BRANDING,
      success_url: `${origin}/pay/${params.token}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pay/${params.token}?canceled=1`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Final payment checkout error:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
