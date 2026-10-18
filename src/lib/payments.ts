/**
 * Final-payment arithmetic, shared by the payment page, the checkout route and
 * the webhook so all three agree on every amount.
 *
 * Booking money columns (total, deposit, balance) are whole dollars; tips are
 * cents, because a percentage tip is rarely a whole dollar.
 *
 * No Node-only imports here: the payment page's client component uses these
 * same functions. Token generation lives in payment-token.ts.
 */

/** Suggested tip rates shown on the payment page. */
export const TIP_RATES = [0.05, 0.1, 0.15] as const;

type Billable = {
  total: number;
  balance: number;
  paidInFull: boolean;
};

/** What the client still owes, before any tip. */
export function amountDueCents(b: Billable): number {
  if (b.paidInFull) return 0;
  return Math.max(0, Math.round(b.balance * 100));
}

/**
 * Tips are suggested on the full session price rather than the remainder:
 * people tip on the whole service, and a percentage of a balance that has a
 * deposit already taken out of it under-suggests.
 */
export function tipBaseCents(b: Billable): number {
  return Math.max(0, Math.round(b.total * 100));
}

export function suggestedTipCents(b: Billable): number[] {
  const base = tipBaseCents(b);
  return TIP_RATES.map((r) => Math.round(base * r));
}

/** The largest tip accepted — the session price — to catch a mistyped amount. */
export function maxTipCents(b: Billable): number {
  return tipBaseCents(b);
}

export type TipCheck = { ok: true; tipCents: number } | { ok: false; error: string };

export function validateTip(b: Billable & { tipEnabled: boolean }, raw: unknown): TipCheck {
  const tip = raw === undefined || raw === null ? 0 : typeof raw === "number" ? raw : NaN;
  if (!Number.isInteger(tip)) return { ok: false, error: "Tip must be a whole number of cents." };
  if (tip < 0) return { ok: false, error: "Tip cannot be negative." };
  if (tip > 0 && !b.tipEnabled) return { ok: false, error: "Tips aren't enabled for this payment." };
  if (tip > maxTipCents(b)) return { ok: false, error: "That tip is larger than the session itself." };
  return { ok: true, tipCents: tip };
}

/** Converts a dollars string the client typed ("12", "12.5", "$12.50") to cents. */
export function dollarsToCents(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, "");
  if (cleaned === "") return 0;
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  return Math.round(parseFloat(cleaned) * 100);
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function paymentUrl(token: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://haileybrookephotography.com").replace(/\/$/, "");
  return `${base}/pay/${token}`;
}

/** "2026-09-12" → "Saturday, September 12" without a UTC day shift. */
export function formatSessionDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return iso || "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function firstName(fullName: string): string {
  return (fullName || "").trim().split(/\s+/)[0] || "there";
}
