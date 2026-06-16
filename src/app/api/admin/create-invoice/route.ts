import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { prisma, isDbConfigured } from "@/lib/db";
import { isAuthed } from "@/lib/admin-auth";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DUE_DAYS = 14; // give the client time to pay on a one-off invoice

interface CreateInvoiceBody {
  fullName: string;
  email: string;
  phone?: string;
  sessionType: string;
  sessionDate: string; // yyyy-mm-dd
  sessionTime?: string;
  total: number; // dollars
  description: string;
}

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

  let body: CreateInvoiceBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // ---- Validate ---------------------------------------------------------
  const fullName = (body.fullName || "").trim();
  const email = (body.email || "").trim();
  const phone = (body.phone || "").trim();
  const sessionType = (body.sessionType || "").trim();
  const sessionDate = (body.sessionDate || "").trim();
  const sessionTime = (body.sessionTime || "").trim();
  const description = (body.description || "").trim();
  const totalNum = Number(body.total);

  if (!fullName) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required to send the invoice." }, { status: 400 });
  }
  if (!sessionType) return NextResponse.json({ error: "Session type is required." }, { status: 400 });
  if (!sessionDate || !ISO_DATE_RE.test(sessionDate)) {
    return NextResponse.json({ error: "A valid date is required." }, { status: 400 });
  }
  if (!description) return NextResponse.json({ error: "Description is required." }, { status: 400 });
  if (!Number.isFinite(totalNum) || totalNum <= 0) {
    return NextResponse.json({ error: "Total must be a positive amount." }, { status: 400 });
  }
  if (totalNum > 1_000_000) {
    return NextResponse.json({ error: "Total looks suspiciously high." }, { status: 400 });
  }
  // Whole dollars only — keeps the dashboard total in sync with the Stripe charge.
  const totalDollars = Math.round(totalNum);
  if (totalDollars < 1) {
    return NextResponse.json({ error: "Total must be at least $1." }, { status: 400 });
  }
  const totalCents = totalDollars * 100;

  const stripe = getStripe();

  try {
    // ---- Stripe: customer + invoice + item + send -----------------------
    const customer = await stripe.customers.create({
      name: fullName,
      email,
      phone: phone || undefined,
    });

    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: DUE_DAYS,
      description: `${sessionType}${sessionDate ? ` — ${sessionDate}` : ""}`,
      metadata: { source: "admin-custom-invoice" },
    });

    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: totalCents,
      currency: "usd",
      description,
    });

    // Finalizes and emails the hosted invoice to the customer.
    const sent = await stripe.invoices.sendInvoice(invoice.id as string);

    // ---- Persist a Booking record so it appears in the dashboard --------
    const booking = await prisma.booking.create({
      data: {
        kind: "invoice",
        fullName,
        email,
        phone,
        sessionType,
        packageName: "Custom invoice",
        sessionDate,
        sessionTime,
        notes: description,
        total: totalDollars,
        deposit: 0,
        balance: totalDollars,
        depositPaid: false,
        paidInFull: false,
        status: "confirmed",
        stripeCustomerId: customer.id,
        balanceInvoiceId: invoice.id,
        balanceInvoiceUrl: sent.hosted_invoice_url ?? null,
      },
    });

    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      invoiceUrl: sent.hosted_invoice_url,
    });
  } catch (err) {
    console.error("Create custom invoice error:", err);
    return NextResponse.json(
      { error: "Could not create the invoice. Please try again." },
      { status: 500 }
    );
  }
}
