import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin-auth";
import { prisma, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

// TEMPORARY — one-off restore after the Railway database was lost. Accepts the
// records rebuilt from Stripe and Resend, so client details travel over HTTPS
// straight into the database instead of being committed. Remove once used.

type BookingIn = Record<string, unknown> & { createdAt: string };
type InquiryIn = {
  createdAt: string; name: string; email: string; phone?: string | null;
  sessionType: string; preferredDate?: string | null; message: string;
  status?: string; emailSent?: boolean;
};

const STR = (v: unknown) => (typeof v === "string" ? v : "");
const OPT = (v: unknown) => (typeof v === "string" && v !== "" ? v : null);
const INT = (v: unknown) => (typeof v === "number" ? Math.round(v) : 0);

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const body = (await req.json()) as { bookings?: BookingIn[]; inquiries?: InquiryIn[] };
  const result = { bookings: { created: 0, skipped: 0 }, inquiries: { created: 0, skipped: 0 } };

  for (const b of body.bookings ?? []) {
    const sessionId = OPT(b.stripeSessionId);
    const invoiceId = OPT(b.balanceInvoiceId);
    const where = sessionId ? { stripeSessionId: sessionId } : { balanceInvoiceId: invoiceId };
    if (await prisma.booking.findFirst({ where })) { result.bookings.skipped++; continue; }
    await prisma.booking.create({
      data: {
        createdAt: new Date(b.createdAt),
        kind: STR(b.kind) || "session",
        fullName: STR(b.fullName) || "Unknown",
        email: OPT(b.email),
        phone: STR(b.phone),
        social: OPT(b.social),
        sessionType: STR(b.sessionType),
        packageName: STR(b.packageName),
        sessionDate: STR(b.sessionDate),
        sessionTime: STR(b.sessionTime),
        notes: OPT(b.notes),
        prints: OPT(b.prints),
        total: INT(b.total),
        deposit: INT(b.deposit),
        balance: INT(b.balance),
        depositPaid: b.depositPaid === true,
        paidInFull: b.paidInFull === true,
        status: STR(b.status) || "confirmed",
        stripeSessionId: sessionId,
        stripeCustomerId: OPT(b.stripeCustomerId),
        stripePaymentIntentId: OPT(b.stripePaymentIntentId),
        balanceInvoiceId: invoiceId,
        balanceInvoiceUrl: OPT(b.balanceInvoiceUrl),
      },
    });
    result.bookings.created++;
  }

  for (const q of body.inquiries ?? []) {
    const createdAt = new Date(q.createdAt);
    if (await prisma.inquiry.findFirst({ where: { email: q.email, createdAt } })) {
      result.inquiries.skipped++; continue;
    }
    await prisma.inquiry.create({
      data: {
        createdAt, name: q.name, email: q.email, phone: q.phone ?? null,
        sessionType: q.sessionType, preferredDate: q.preferredDate ?? null,
        message: q.message, status: q.status ?? "new", emailSent: q.emailSent ?? true,
      },
    });
    result.inquiries.created++;
  }

  const [bookings, inquiries] = await Promise.all([
    prisma.booking.findMany({ orderBy: { createdAt: "asc" },
      select: { createdAt: true, kind: true, fullName: true, total: true, paidInFull: true } }),
    prisma.inquiry.findMany({ orderBy: { createdAt: "asc" },
      select: { createdAt: true, name: true, sessionType: true, preferredDate: true } }),
  ]);
  return NextResponse.json({ result, bookings, inquiries });
}
