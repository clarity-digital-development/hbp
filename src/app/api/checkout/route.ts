import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { computeTotals, printsSummary, type Quantities } from "@/lib/pricing";

export const runtime = "nodejs";

interface CheckoutBody {
  packageName: string;
  quantities: Quantities;
  fullName: string;
  phone: string;
  social?: string;
  sessionType: string;
  date: string; // ISO yyyy-mm-dd
  time: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments aren't connected yet. Add your Stripe keys to .env.local." },
      { status: 503 }
    );
  }

  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { packageName, quantities, fullName, phone, sessionType, date, time } = body;
  if (!packageName || !fullName || !phone || !sessionType || !date || !time) {
    return NextResponse.json({ error: "Missing required booking details." }, { status: 400 });
  }

  // Recompute the deposit on the server — never trust a client-sent amount.
  const { total, deposit, balance } = computeTotals(packageName, quantities || {});
  if (deposit <= 0) {
    return NextResponse.json({ error: "Could not determine a deposit amount." }, { status: 400 });
  }

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3005";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Omit payment_method_types entirely → dynamic payment methods
      // (cards, Apple Pay, Google Pay, etc., configured from the Dashboard).
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: deposit * 100, // cents
            product_data: {
              name: `${sessionType} Session Deposit`,
              description: `30% deposit · ${packageName} package · ${date} at ${time}`,
            },
          },
        },
      ],
      // Collect the customer's email so a balance link can be sent later.
      phone_number_collection: { enabled: false },
      success_url: `${origin}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book?status=cancelled`,
      metadata: {
        fullName,
        phone,
        social: body.social || "",
        sessionType,
        packageName,
        date,
        time,
        notes: (body.notes || "").slice(0, 480),
        prints: printsSummary(quantities || {}),
        sessionTotal: String(total),
        deposit: String(deposit),
        balance: String(balance),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
