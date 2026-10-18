import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { isAuthed } from "@/lib/admin-auth";
import { amountDueCents, paymentUrl } from "@/lib/payments";
import { newPaymentToken } from "@/lib/payment-token";
import { sendEmail, paymentRequestEmail } from "@/lib/emails";

export const runtime = "nodejs";

/**
 * Sends (or re-sends) a booking's final-payment link. The link is stable: a
 * resend emails the same /pay URL, so an earlier email still works.
 */
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "The database isn't configured." }, { status: 503 });
  }

  let bookingId = "";
  try {
    ({ bookingId } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId || "" } });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.kind === "invoice") {
    return NextResponse.json({ error: "This one was billed with a Stripe invoice — use its invoice link." }, { status: 400 });
  }
  if (amountDueCents(booking) <= 0) {
    return NextResponse.json({ error: "Nothing left to pay on this booking." }, { status: 400 });
  }

  // A balance invoice sent the old way may still be payable in Stripe. Two live
  // ways to pay the same balance is how a client ends up paying twice.
  if (booking.balanceInvoiceId && isStripeConfigured()) {
    try {
      const invoice = await getStripe().invoices.retrieve(booking.balanceInvoiceId);
      if (invoice.status === "paid") {
        await prisma.booking.update({ where: { id: booking.id }, data: { paidInFull: true } });
        return NextResponse.json({ error: "Their Stripe invoice is already paid — marked paid in full." }, { status: 409 });
      }
      if (invoice.status === "open" || invoice.status === "draft") {
        return NextResponse.json(
          { error: "A Stripe invoice for this balance is still open. Void it in Stripe first so they can't pay twice." },
          { status: 409 }
        );
      }
    } catch (err) {
      console.error("Could not check the old balance invoice:", err);
      return NextResponse.json({ error: "Couldn't check the earlier Stripe invoice. Try again in a moment." }, { status: 502 });
    }
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentToken: booking.paymentToken ?? newPaymentToken(),
      // The first request starts the reminder clock; a resend doesn't restart it.
      finalRequestedAt: booking.finalRequestedAt ?? new Date(),
    },
  });
  const url = paymentUrl(updated.paymentToken!);

  if (!updated.email) {
    return NextResponse.json({ ok: true, url, emailed: false });
  }
  const sent = await sendEmail(paymentRequestEmail(updated));
  if (!sent.ok) {
    return NextResponse.json(
      { ok: true, url, emailed: false, warning: "The link is ready, but the email didn't send. Copy the link and text it instead." },
      { status: 200 }
    );
  }
  return NextResponse.json({ ok: true, url, emailed: true });
}
