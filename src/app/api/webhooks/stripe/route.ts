import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { Resend } from "resend";
import { getStripe } from "@/lib/stripe";
import { prisma, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

const TO_EMAIL = "bookings@haileybrookephotography.com";

function toInt(v: string | undefined): number {
  const n = parseInt(v || "0", 10);
  return Number.isFinite(n) ? n : 0;
}

/** Notifies Hailey that a deposit landed. Never throws — a mail failure must
 *  not cost us the booking row, which is the durable record. */
async function notifyBooking(session: Stripe.Checkout.Session) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — booking notification skipped");
    return;
  }
  const m = session.metadata || {};
  const email = session.customer_details?.email || "";
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from =
    process.env.CONTACT_FROM_EMAIL ||
    "Hailey Brooke Photography <noreply@haileybrookephotography.com>";

  const { error } = await resend.emails.send({
    from,
    to: TO_EMAIL,
    ...(email ? { replyTo: email } : {}),
    subject: `New booking — ${m.packageName || "Session"} — ${m.fullName || "Unknown"}`,
    text: [
      `${m.fullName || "Unknown"} just paid a deposit.`,
      ``,
      `Package:  ${m.packageName || "-"}`,
      `Type:     ${m.sessionType || "-"}`,
      `Date:     ${m.date || "-"} ${m.time || ""}`,
      `Deposit:  $${toInt(m.deposit)} paid`,
      `Balance:  $${toInt(m.balance)} due`,
      `Total:    $${toInt(m.sessionTotal)}`,
      ``,
      `Email:    ${email || "-"}`,
      `Phone:    ${m.phone || "-"}`,
      `Social:   ${m.social || "-"}`,
      `Prints:   ${m.prints || "none"}`,
      ``,
      `Notes:`,
      m.notes || "(none)",
      ``,
      `Stripe session: ${session.id}`,
    ].join("\n"),
  });

  if (error) console.error("Booking notification failed to send:", error);
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

        if (!isDbConfigured()) {
          // Surfacing this is the whole point: a silent skip here is how a paid
          // booking disappears without anyone noticing.
          throw new Error("DATABASE_URL is not set — cannot persist booking");
        }

        // Idempotent: one booking per checkout session, so Stripe retries and
        // manual replays are safe.
        const existing = await prisma.booking.findUnique({
          where: { stripeSessionId: session.id },
          select: { id: true },
        });

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

        // Only notify the first time, so a retry doesn't re-send the email.
        if (!existing) await notifyBooking(session);

        console.log("Deposit paid — booking confirmed:", m.fullName, m.date, m.time);
        break;
      }

      // Stripe fires both of these for a paid invoice, and which one an endpoint
      // is subscribed to varies. Handle either so the balance is marked paid.
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!isDbConfigured()) throw new Error("DATABASE_URL is not set");
        if (invoice.id) {
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
    // Return 5xx so Stripe retries (it backs off for ~3 days) and the failure is
    // visible in the dashboard. The previous handler swallowed this and returned
    // 200, which is how a failed write looked like a delivered webhook.
    console.error("Webhook handler error:", event.type, err);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
