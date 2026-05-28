import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const TO_EMAIL = "bookings@haileybrookephotography.com";

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email isn't connected yet. Add RESEND_API_KEY to .env.local." },
      { status: 503 }
    );
  }

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
      return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact send failed:", err);
    return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 500 });
  }
}
