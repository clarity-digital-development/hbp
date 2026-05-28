import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { prisma, isDbConfigured } from "@/lib/db";
import { isAuthed } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isStripeConfigured() || !isDbConfigured()) {
    return NextResponse.json(
      { error: "Stripe and the database must be configured." },
      { status: 503 }
    );
  }

  let bookingId = "";
  try {
    ({ bookingId } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.paidInFull || booking.balance <= 0) {
    return NextResponse.json({ error: "Nothing left to invoice." }, { status: 400 });
  }
  if (!booking.email) {
    return NextResponse.json(
      { error: "No email on file for this booking, so an invoice can't be emailed." },
      { status: 400 }
    );
  }

  const stripe = getStripe();

  try {
    // Reuse the Customer created at checkout; create one if missing.
    let customerId = booking.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: booking.fullName,
        email: booking.email,
        phone: booking.phone || undefined,
      });
      customerId = customer.id;
    }

    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "send_invoice",
      days_until_due: 7,
      description: `Remaining balance for your ${booking.sessionType} session on ${booking.sessionDate}.`,
      metadata: { bookingId: booking.id },
    });

    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: booking.balance * 100, // cents
      currency: "usd",
      description: `Remaining balance — ${booking.packageName} (${booking.sessionType})`,
    });

    // Finalizes and emails the hosted invoice to the customer.
    const sent = await stripe.invoices.sendInvoice(invoice.id as string);

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripeCustomerId: customerId,
        balanceInvoiceId: invoice.id,
        balanceInvoiceUrl: sent.hosted_invoice_url ?? null,
      },
    });

    return NextResponse.json({ ok: true, url: sent.hosted_invoice_url });
  } catch (err) {
    console.error("Send invoice error:", err);
    return NextResponse.json({ error: "Could not send the invoice. Please try again." }, { status: 500 });
  }
}
