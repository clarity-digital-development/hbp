import { NextRequest, NextResponse } from "next/server";
import type { Booking } from "@prisma/client";
import { prisma, isDbConfigured } from "@/lib/db";
import { dueFollowups, type FollowupKind } from "@/lib/followups";
import {
  sendEmail,
  shootReminderEmail,
  thankYouEmail,
  paymentReminderEmail,
  reviewRequestEmail,
  rebookEmail,
  type Email,
} from "@/lib/emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function emailFor(kind: FollowupKind, b: Booking, reviewUrl: string): Email {
  switch (kind) {
    case "shoot-reminder":
      return shootReminderEmail(b);
    case "thank-you":
      return thankYouEmail(b);
    case "payment-reminder-1":
      return paymentReminderEmail(b, 1);
    case "payment-reminder-2":
      return paymentReminderEmail(b, 2);
    case "review-request":
      return reviewRequestEmail(b, reviewUrl);
    case "rebook":
      return rebookEmail(b);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The daily follow-up run, triggered by Vercel Cron (vercel.json). Each email
 * is claimed in EmailLog before it's sent, so overlapping or repeated runs
 * never send the same email twice; a failed send releases the claim and the
 * next day's run tries again.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "The database isn't configured." }, { status: 503 });
  }

  const now = new Date();
  const reviewUrl = process.env.GOOGLE_REVIEW_URL || "";
  const bookings = await prisma.booking.findMany({
    where: { email: { not: null }, status: { not: "cancelled" }, kind: { in: ["session", "request"] } },
  });

  const sent: string[] = [];
  const failed: string[] = [];
  for (const b of bookings) {
    for (const kind of dueFollowups(b, now, { reviewUrl })) {
      const claimed = await prisma.emailLog.create({ data: { bookingId: b.id, kind } }).then(
        () => true,
        (err) => {
          if (err?.code === "P2002") return false; // sent on an earlier run
          throw err;
        }
      );
      if (!claimed) continue;

      const result = await sendEmail(emailFor(kind, b, reviewUrl));
      if (result.ok) {
        sent.push(`${b.id}:${kind}`);
      } else {
        await prisma.emailLog.deleteMany({ where: { bookingId: b.id, kind } });
        failed.push(`${b.id}:${kind}`);
      }
      await sleep(600); // stay under Resend's per-second rate limit
    }
  }

  console.log(`Follow-ups: ${sent.length} sent, ${failed.length} failed, ${bookings.length} bookings checked`);
  return NextResponse.json({ checked: bookings.length, sent, failed });
}
