import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

function toInt(v: string | undefined): number {
  const n = parseInt(v || "0", 10);
  return Number.isFinite(n) ? n : 0;
}

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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const m = session.metadata || {};
        if (isDbConfigured()) {
          // Idempotent: one booking per checkout session.
          await prisma.booking.upsert({
            where: { stripeSessionId: session.id },
            create: {
              fullName: m.fullName || "Unknown",
              email: session.customer_details?.email || null,
              phone: m.phone || "",
              social: m.social || null,
              sessionType: m.sessionType || "",
              packageName: m.packageName || "",
              sessionDate: m.date || "",
              sessionTime: m.time || "",
              notes: m.notes || null,
              prints: m.prints || null,
              total: toInt(m.sessionTotal),
              deposit: toInt(m.deposit),
              balance: toInt(m.balance),
              depositPaid: true,
              paidInFull: toInt(m.balance) <= 0,
              status: "confirmed",
              stripeSessionId: session.id,
              stripeCustomerId:
                typeof session.customer === "string" ? session.customer : null,
              stripePaymentIntentId:
                typeof session.payment_intent === "string" ? session.payment_intent : null,
            },
            update: { depositPaid: true, status: "confirmed" },
          });
        }
        console.log("✅ Deposit paid — booking confirmed:", m.fullName, m.date, m.time);
        break;
      }

      case "invoice.paid": {
        // Balance invoice paid → mark the booking paid in full.
        const invoice = event.data.object as Stripe.Invoice;
        if (isDbConfigured() && invoice.id) {
          await prisma.booking.updateMany({
            where: { balanceInvoiceId: invoice.id },
            data: { paidInFull: true },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        console.warn("Deposit payment failed:", event.id);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // Don't 500 on DB hiccups — log and acknowledge so Stripe doesn't retry forever.
    console.error("Webhook handler error:", err);
  }

  return NextResponse.json({ received: true });
}
