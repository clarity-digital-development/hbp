import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

const TO_EMAIL = "bookings@haileybrookephotography.com";

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, phone, sessionType, date, message } = body;
  if (!name || !email || !sessionType || !message) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  // Persist before emailing. The notification is best-effort; the row is the
  // durable record and is what the admin dashboard reads.
  let inquiryId: string | null = null;
  if (isDbConfigured()) {
    try {
      const row = await prisma.inquiry.create({
        data: {
          name,
          email,
          phone: phone || null,
          sessionType,
          preferredDate: date || null,
          message,
        },
      });
      inquiryId = row.id;
    } catch (err) {
      console.error("Failed to save inquiry:", err);
    }
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — inquiry saved but not emailed");
    return NextResponse.json({ ok: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  // From must be on a domain verified in Resend (e.g. haileybrookephotography.com).
  const from =
    process.env.CONTACT_FROM_EMAIL ||
    "Hailey Brooke Photography <noreply@haileybrookephotography.com>";

  try {
    const { error } = await resend.emails.send({
      from,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New inquiry — ${sessionType} — ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        `Session type: ${sessionType}`,
        `Preferred date: ${date || "—"}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend error:", error);
      // The inquiry is already stored, so telling the visitor it failed would
      // only produce a duplicate. Flag it for the dashboard instead.
      if (inquiryId) {
        await prisma.inquiry
          .update({ where: { id: inquiryId }, data: { emailSent: false } })
          .catch(() => {});
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact send failed:", err);
    if (inquiryId) {
      await prisma.inquiry
        .update({ where: { id: inquiryId }, data: { emailSent: false } })
        .catch(() => {});
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 500 });
  }
}
