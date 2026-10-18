import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db";
import { isAuthed } from "@/lib/admin-auth";
import { paymentUrl } from "@/lib/payments";
import { newPaymentToken } from "@/lib/payment-token";
import { sendEmail, paymentRequestEmail } from "@/lib/emails";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface PaymentRequestBody {
  fullName: string;
  email: string;
  phone?: string;
  sessionType: string;
  sessionDate?: string; // yyyy-mm-dd
  sessionTime?: string;
  amountDue: number; // dollars
  alreadyPaid?: number; // dollars — a retainer paid some other way
  description?: string;
  tipEnabled?: boolean;
}

/**
 * A payment link for a client who didn't book through the site — a wedding, a
 * referral. Replaces the Stripe custom invoice, which can't take a tip.
 */
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "The database isn't configured." }, { status: 503 });
  }

  let body: PaymentRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const fullName = (body.fullName || "").trim();
  const email = (body.email || "").trim();
  const phone = (body.phone || "").trim();
  const sessionType = (body.sessionType || "").trim();
  const sessionDate = (body.sessionDate || "").trim();
  const sessionTime = (body.sessionTime || "").trim();
  const description = (body.description || "").trim();
  const due = Number(body.amountDue);
  const paid = Number(body.alreadyPaid || 0);

  if (!fullName) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required to send the link." }, { status: 400 });
  }
  if (!sessionType) return NextResponse.json({ error: "Say what it's for — e.g. Wedding." }, { status: 400 });
  if (sessionDate && !ISO_DATE_RE.test(sessionDate)) {
    return NextResponse.json({ error: "That date doesn't look right." }, { status: 400 });
  }
  // Whole dollars, like every other amount on a booking.
  if (!Number.isInteger(due) || due < 1) {
    return NextResponse.json({ error: "Amount due must be a whole number of dollars, at least $1." }, { status: 400 });
  }
  if (!Number.isInteger(paid) || paid < 0) {
    return NextResponse.json({ error: "Already paid must be a whole number of dollars." }, { status: 400 });
  }
  if (due + paid > 100_000) {
    return NextResponse.json({ error: "That total looks too high — double-check it." }, { status: 400 });
  }

  const booking = await prisma.booking.create({
    data: {
      kind: "request",
      fullName,
      email,
      phone,
      sessionType,
      packageName: "",
      sessionDate,
      sessionTime,
      notes: description || null,
      // Tips are suggested on the full price, so a retainer paid elsewhere
      // still counts toward the total.
      total: due + paid,
      deposit: paid,
      balance: due,
      depositPaid: paid > 0,
      paidInFull: false,
      status: "confirmed",
      tipEnabled: body.tipEnabled !== false,
      paymentToken: newPaymentToken(),
      finalRequestedAt: new Date(),
    },
  });
  const url = paymentUrl(booking.paymentToken!);

  const sent = await sendEmail(paymentRequestEmail(booking));
  return NextResponse.json({
    ok: true,
    bookingId: booking.id,
    url,
    emailed: sent.ok,
    ...(sent.ok ? {} : { warning: "Saved, but the email didn't send. Copy the link and send it yourself." }),
  });
}
