/**
 * Which follow-up emails a booking is due today. Pure: the caller supplies the
 * dates, so the schedule can be tested without a clock.
 *
 * Every rule fires inside a window rather than on one exact day. A missed or
 * late cron run still catches up, but a booking whose trigger is long past —
 * an old record restored or imported later — never receives a stale email.
 * The EmailLog table guarantees each kind is sent at most once per booking.
 */

export type FollowupKind =
  | "shoot-reminder"
  | "thank-you"
  | "payment-reminder-1"
  | "payment-reminder-2"
  | "review-request"
  | "rebook";

export const FOLLOWUP_KINDS: FollowupKind[] = [
  "shoot-reminder",
  "thank-you",
  "payment-reminder-1",
  "payment-reminder-2",
  "review-request",
  "rebook",
];

type FollowupBooking = {
  kind: string;
  status: string;
  email: string | null;
  sessionDate: string;
  depositPaid: boolean;
  paidInFull: boolean;
  paymentToken: string | null;
  finalRequestedAt: Date | null;
  finalPaidAt: Date | null;
};

const DAY = 86_400_000;

/** Today's calendar date in Kentucky, as yyyy-mm-dd. */
export function todayInKentucky(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Whole days from `a` to `b`, both yyyy-mm-dd. Positive when b is later. */
export function daysBetween(a: string, b: string): number | null {
  const re = /^(\d{4})-(\d{2})-(\d{2})$/;
  const ma = re.exec(a), mb = re.exec(b);
  if (!ma || !mb) return null;
  const ta = Date.UTC(+ma[1], +ma[2] - 1, +ma[3]);
  const tb = Date.UTC(+mb[1], +mb[2] - 1, +mb[3]);
  return Math.round((tb - ta) / DAY);
}

const elapsedDays = (since: Date, now: Date) => (now.getTime() - since.getTime()) / DAY;

export function dueFollowups(
  b: FollowupBooking,
  now: Date,
  opts: { reviewUrl?: string } = {}
): FollowupKind[] {
  if (!b.email || b.status === "cancelled") return [];
  // Legacy Stripe-invoice bookings predate this system and are left alone.
  if (b.kind !== "session" && b.kind !== "request") return [];

  const due: FollowupKind[] = [];
  const today = todayInKentucky(now);
  // Days from the session to today: -1 = tomorrow, 1 = yesterday.
  const sinceSession = daysBetween(b.sessionDate, today);
  const isRealClient = b.depositPaid || b.paidInFull || b.kind === "request";

  if (sinceSession === -1 && isRealClient) {
    due.push("shoot-reminder");
  }

  // 1–3 days after. Skipped once a payment request has gone out, because that
  // email already thanks them and two the same day would be one too many.
  if (sinceSession !== null && sinceSession >= 1 && sinceSession <= 3 && isRealClient && !b.finalRequestedAt) {
    due.push("thank-you");
  }

  if (b.finalRequestedAt && b.paymentToken && !b.paidInFull) {
    const d = elapsedDays(b.finalRequestedAt, now);
    // Non-overlapping windows, so a late run sends the one that fits, not both.
    if (d >= 3 && d < 7) due.push("payment-reminder-1");
    else if (d >= 7 && d < 21) due.push("payment-reminder-2");
  }

  if (b.finalPaidAt && opts.reviewUrl) {
    const d = elapsedDays(b.finalPaidAt, now);
    if (d >= 7 && d < 21) due.push("review-request");
  }

  // About eleven months on, for self-booked sessions only — a wedding couple
  // gets a different conversation, not a "book again" nudge.
  if (b.kind === "session" && sinceSession !== null && sinceSession >= 335 && sinceSession <= 349 && isRealClient) {
    due.push("rebook");
  }

  return due;
}
