import { Resend } from "resend";
import {
  amountDueCents,
  firstName,
  formatCents,
  formatSessionDate,
  paymentUrl,
} from "@/lib/payments";

/**
 * Every transactional and follow-up email the site sends, in Hailey's voice.
 *
 * HTML is table-based with inline styles and Georgia: web fonts and external
 * CSS are unreliable across email clients. Each template also returns plain
 * text for clients that don't render HTML.
 */

export const OWNER_EMAIL = "bookings@haileybrookephotography.com";
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://haileybrookephotography.com").replace(/\/$/, "");

/** html is optional: Hailey's own plain notifications send text only. */
export type Email = { to: string; subject: string; text: string; html?: string; replyTo?: string };

type BookingLike = {
  kind: string;
  fullName: string;
  email: string | null;
  sessionType: string;
  packageName: string;
  sessionDate: string;
  sessionTime: string;
  total: number;
  deposit: number;
  balance: number;
  paidInFull: boolean;
  tipEnabled: boolean;
  paymentToken: string | null;
  notes?: string | null;
};

// ---- Sending ----------------------------------------------------------------

/** Never throws. EMAIL_DRY_RUN=1 logs instead of sending (local testing). */
export async function sendEmail(email: Email): Promise<{ ok: boolean; error?: string }> {
  if (process.env.EMAIL_DRY_RUN === "1") {
    console.log(`[email dry-run] to=${email.to} subject="${email.subject}"`);
    return { ok: true };
  }
  if (!process.env.RESEND_API_KEY) {
    console.warn(`RESEND_API_KEY not set — not sent: "${email.subject}"`);
    return { ok: false, error: "Email is not configured." };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "Hailey Brooke Photography <noreply@haileybrookephotography.com>",
      to: email.to,
      replyTo: email.replyTo ?? OWNER_EMAIL,
      subject: email.subject,
      text: email.text,
      ...(email.html ? { html: email.html } : {}),
    });
    if (error) {
      console.error("Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return { ok: false, error: "Send failed." };
  }
}

// ---- Layout -----------------------------------------------------------------

const C = { olive: "#757A3B", ink: "#2B2A26", soft: "#6F6C63", ground: "#FFFCF5", rule: "#E9E6DC", gold: "#C2A45C" };

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

type Block = { p: string } | { button: { label: string; href: string } } | { rows: [string, string][] };

function render(blocks: Block[], preheader: string): string {
  const body = blocks
    .map((b) => {
      if ("p" in b) {
        return `<p style="margin:0 0 16px;text-align:center;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:${C.ink};">${esc(b.p).replace(/\n/g, "<br>")}</p>`;
      }
      if ("button" in b) {
        return `<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:8px auto 24px;"><tr><td style="background:${C.olive};border-radius:2px;">
<a href="${esc(b.button.href)}" style="display:inline-block;padding:14px 28px;font-family:Georgia,serif;font-size:15px;letter-spacing:0.08em;color:#ffffff;text-decoration:none;text-transform:uppercase;">${esc(b.button.label)}</a>
</td></tr></table>`;
      }
      return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;border-top:1px solid ${C.rule};">${b.rows
        .map(
          ([k, v]) =>
            `<tr><td align="left" style="padding:10px 0;border-bottom:1px solid ${C.rule};font-family:Georgia,serif;font-size:15px;color:${C.soft};">${esc(k)}</td><td align="right" style="padding:10px 0;border-bottom:1px solid ${C.rule};font-family:Georgia,serif;font-size:15px;color:${C.ink};">${esc(v)}</td></tr>`
        )
        .join("")}</table>`;
    })
    .join("\n");

  return `<!doctype html><html><body style="margin:0;padding:0;background:${C.ground};">
<span style="display:none;max-height:0;overflow:hidden;">${esc(preheader)}</span>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${C.ground};"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;">
<tr><td align="center" style="padding:0 0 24px;border-bottom:2px solid ${C.gold};text-align:center;font-family:Georgia,serif;font-size:22px;font-style:italic;color:${C.olive};">Hailey Brooke Photography</td></tr>
<tr><td style="padding:28px 0 8px;">${body}</td></tr>
<tr><td align="center" style="padding:20px 0 0;border-top:1px solid ${C.rule};text-align:center;font-family:Georgia,serif;font-size:13px;line-height:1.6;color:${C.soft};">
Hailey Brooke Photography · Kentucky<br>Questions? Just reply to this email or call 502-837-0871.
</td></tr>
</table></td></tr></table></body></html>`;
}

function textOf(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if ("p" in b) return b.p;
      if ("button" in b) return `${b.button.label}: ${b.button.href}`;
      return b.rows.map(([k, v]) => `${k}: ${v}`).join("\n");
    })
    .join("\n\n");
}

function build(to: string, subject: string, preheader: string, blocks: Block[], replyTo?: string): Email {
  return { to, subject, text: textOf(blocks) + "\n\n— Hailey Brooke Photography", html: render(blocks, preheader), replyTo };
}

const sign: Block = { p: "Hailey" };
const isSession = (b: BookingLike) => b.kind === "session";
const label = (b: BookingLike) => (b.sessionType || "photography").toLowerCase();

function payButton(b: BookingLike): Block {
  return { button: { label: "View & pay balance", href: paymentUrl(b.paymentToken || "") } };
}

// ---- Final payment ----------------------------------------------------------

export function paymentRequestEmail(b: BookingLike): Email {
  const due = formatCents(amountDueCents(b));
  const blocks: Block[] = [
    { p: `Hi ${firstName(b.fullName)},` },
    isSession(b)
      ? { p: `Thank you again for choosing me for your ${label(b)} session — I loved working with you. Your remaining balance is ${due}, and you can take care of it here in about a minute:` }
      : { p: `Here's your payment link for your ${label(b)} with me. The amount due is ${due}, and you can pay securely here:` },
    payButton(b),
  ];
  if (b.tipEnabled) blocks.push({ p: "If you'd like to leave a tip, you'll find that option on the payment page too — always appreciated, never expected." });
  blocks.push({ p: "If you have any questions at all, just reply to this email." }, sign);
  return build(b.email!, isSession(b) ? `Your final payment — ${b.sessionType} session` : `Your payment link — ${b.sessionType}`, `Balance due: ${due}`, blocks);
}

export function paymentReminderEmail(b: BookingLike, attempt: 1 | 2): Email {
  const due = formatCents(amountDueCents(b));
  const blocks: Block[] =
    attempt === 1
      ? [
          { p: `Hi ${firstName(b.fullName)},` },
          { p: `Just a friendly reminder that your balance of ${due} for your ${label(b)} is still open.` },
          payButton(b),
          { p: "If you've already taken care of it, thank you — you can ignore this one." },
          sign,
        ]
      : [
          { p: `Hi ${firstName(b.fullName)},` },
          { p: `I wanted to follow up once more on your balance of ${due} for your ${label(b)}.` },
          payButton(b),
          { p: "If something's come up or you'd like to talk it through, just reply — I'm always happy to help." },
          sign,
        ];
  return build(b.email!, attempt === 1 ? "A quick reminder about your balance" : `Following up on your balance — ${b.sessionType}`, `Balance due: ${due}`, blocks);
}

export function paymentReceivedClientEmail(b: BookingLike, paidCents: number, tipCents: number): Email {
  const blocks: Block[] = [
    { p: `Hi ${firstName(b.fullName)},` },
    {
      p:
        tipCents > 0
          ? `Your payment of ${formatCents(paidCents)} came through — thank you! And thank you so much for the ${formatCents(tipCents)} tip. It truly means a lot.`
          : `Your payment of ${formatCents(paidCents)} came through — thank you!`,
    },
    { p: "You're all paid in full. Stripe will send a separate receipt for your records." },
    { p: "It was such a joy working with you." },
    sign,
  ];
  return build(b.email!, "Thank you — payment received", "You're all paid in full.", blocks);
}

export function paymentReceivedOwnerEmail(b: BookingLike, dueCents: number, tipCents: number, sessionId: string): Email {
  const rows: [string, string][] = [
    ["Client", b.fullName],
    ["Session", `${b.sessionType}${b.packageName ? ` · ${b.packageName}` : ""}`],
    ["Date", formatSessionDate(b.sessionDate)],
    ["Balance paid", formatCents(dueCents)],
    ["Tip", tipCents > 0 ? formatCents(tipCents) : "None"],
    ["Total charged", formatCents(dueCents + tipCents)],
  ];
  const blocks: Block[] = [
    { p: `${b.fullName} just paid their final balance${tipCents > 0 ? ` and left a ${formatCents(tipCents)} tip` : ""}.` },
    { rows },
    { p: `Stripe checkout: ${sessionId}` },
  ];
  return build(
    OWNER_EMAIL,
    `Final payment — ${b.fullName} — ${formatCents(dueCents)}${tipCents > 0 ? ` + ${formatCents(tipCents)} tip` : ""}`,
    "A final payment came in.",
    blocks,
    b.email || undefined
  );
}

export function duplicatePaymentOwnerEmail(b: BookingLike, amountCents: number, sessionId: string): Email {
  const blocks: Block[] = [
    { p: `${b.fullName} paid ${formatCents(amountCents)} on a balance that was already marked paid in full. This is usually two payment tabs left open at once.` },
    { p: `Check Stripe and refund the duplicate if that's what happened. Checkout session: ${sessionId}` },
  ];
  return build(OWNER_EMAIL, `Check Stripe — possible duplicate payment from ${b.fullName}`, "A second payment came in.", blocks, b.email || undefined);
}

// ---- Follow-up sequence -----------------------------------------------------

export function shootReminderEmail(b: BookingLike): Email {
  const when = `${formatSessionDate(b.sessionDate)}${b.sessionTime ? ` at ${b.sessionTime}` : ""}`;
  return build(b.email!, `See you tomorrow, ${firstName(b.fullName)}!`, `Your session is ${when}.`, [
    { p: `Hi ${firstName(b.fullName)},` },
    { p: `Just a quick reminder that your ${label(b)} session is tomorrow — ${when}. I'm so excited!` },
    { p: "If you have any questions about the location, outfits or timing, just reply to this email." },
    { p: "See you soon," },
    sign,
  ]);
}

export function thankYouEmail(b: BookingLike): Email {
  return build(b.email!, `Thank you, ${firstName(b.fullName)}!`, "I'm already working on your photos.", [
    { p: `Hi ${firstName(b.fullName)},` },
    { p: `Thank you so much for your ${label(b)} session — I had such a great time with you.` },
    { p: "I'm already working on your photos, and I'll be in touch as soon as your gallery is ready." },
    sign,
  ]);
}

export function reviewRequestEmail(b: BookingLike, reviewUrl: string): Email {
  return build(b.email!, "Would you share a few words?", "A quick review helps more than you'd think.", [
    { p: `Hi ${firstName(b.fullName)},` },
    { p: "I hope you're loving your photos! If you have a minute, a quick Google review helps other people find me more than anything else I could do." },
    { button: { label: "Leave a review", href: reviewUrl } },
    { p: "And if you know someone who'd love a session, I'd be so grateful for the introduction." },
    { p: "Thank you," },
    sign,
  ]);
}

export function rebookEmail(b: BookingLike): Email {
  return build(b.email!, "Has it really been a year?", "I'd love to photograph you again.", [
    { p: `Hi ${firstName(b.fullName)},` },
    { p: "It's almost been a year since your session — I can't believe how fast that went! If you'd like updated photos, I'd love to see you again." },
    { button: { label: "Book a session", href: `${SITE}/book` } },
    sign,
  ]);
}
