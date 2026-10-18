import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import {
  sendEmail,
  paymentReceivedClientEmail,
  paymentReceivedOwnerEmail,
  duplicatePaymentOwnerEmail,
} from "@/lib/emails";

export type FinalPaymentResult =
  | "recorded" // this call marked the booking paid
  | "already-recorded" // an earlier call (webhook or return page) already did
  | "duplicate" // a second payment on a balance that was already settled
  | "pending" // checkout finished but the money hasn't cleared (bank debit)
  | "not-found";

function toInt(v: string | undefined): number {
  const n = parseInt(v || "0", 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Records a paid final-payment Checkout Session against its booking.
 *
 * Called from the Stripe webhook and from the payment page when the client
 * returns, whichever arrives first — Stripe's recommended fulfilment pattern,
 * so the booking flips to paid even if the webhook is late. The claim is one
 * conditional update, so only the call that wins it sends the emails.
 */
export async function recordFinalPayment(session: Stripe.Checkout.Session): Promise<FinalPaymentResult> {
  const m = session.metadata || {};
  if (session.payment_status !== "paid") return "pending";

  const booking = m.bookingId ? await prisma.booking.findUnique({ where: { id: m.bookingId } }) : null;
  if (!booking) {
    console.error("Final payment for unknown booking:", m.bookingId, session.id);
    return "not-found";
  }

  // What was owed comes from the metadata stamped when checkout started, not
  // today's booking row, so a later edit can't skew the split. Anything above
  // it is the tip.
  const dueCents = toInt(m.dueCents);
  const paidCents = session.amount_total ?? 0;
  const tipCents = Math.max(0, paidCents - dueCents);
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

  const claimed = await prisma.booking.updateMany({
    where: { id: booking.id, paidInFull: false, finalCheckoutSessionId: null },
    data: {
      paidInFull: true,
      finalPaidAt: new Date(),
      tipCents,
      finalCheckoutSessionId: session.id,
      ...(booking.stripeCustomerId ? {} : { stripeCustomerId: customerId }),
    },
  });

  if (claimed.count === 1) {
    const paid = { ...booking, paidInFull: true };
    const sends = [sendEmail(paymentReceivedOwnerEmail(paid, dueCents, tipCents, session.id))];
    if (booking.email) sends.push(sendEmail(paymentReceivedClientEmail(paid, paidCents, tipCents)));
    await Promise.all(sends);
    console.log("Final payment recorded:", booking.fullName, paidCents, "tip", tipCents);
    return "recorded";
  }

  const current = await prisma.booking.findUnique({
    where: { id: booking.id },
    select: { finalCheckoutSessionId: true },
  });
  if (current?.finalCheckoutSessionId === session.id) return "already-recorded";

  // Paid twice — usually two payment tabs. The money is real, so flag it for a
  // refund; the log row keeps webhook retries from re-sending the alert.
  const kind = `duplicate:${session.id}`;
  const firstAlert = await prisma.emailLog.create({ data: { bookingId: booking.id, kind } }).then(
    () => true,
    (err) => {
      if (err?.code === "P2002") return false; // already alerted
      throw err;
    }
  );
  if (firstAlert) {
    console.warn("Duplicate final payment:", booking.fullName, session.id);
    const sent = await sendEmail(duplicatePaymentOwnerEmail(booking, paidCents, session.id));
    // Release the claim so a later call (a replay, the return page) can retry.
    if (!sent.ok) await prisma.emailLog.deleteMany({ where: { bookingId: booking.id, kind } });
  }
  return "duplicate";
}
