import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// Stripe needs the raw, unparsed request body to verify the signature.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const m = session.metadata || {};
      // The deposit has been paid and the date is reserved.
      console.log("✅ Deposit paid — booking confirmed:", {
        name: m.fullName,
        phone: m.phone,
        session: m.sessionType,
        package: m.packageName,
        date: m.date,
        time: m.time,
        deposit: m.deposit,
        balance: m.balance,
        email: session.customer_details?.email,
      });
      // TODO (needs backend services):
      //   1. Persist the booking (e.g., Prisma/Postgres) so the date is held.
      //   2. Email Hailey the new booking + email the client a confirmation.
      //   3. Create/store a balance payment link (Invoice or Payment Link) to send later.
      break;
    }
    case "payment_intent.payment_failed": {
      console.warn("Deposit payment failed:", event.id);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
