import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock } from "lucide-react";
import { prisma, isDbConfigured } from "@/lib/db";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { recordFinalPayment } from "@/lib/final-payment";
import { amountDueCents, formatCents, formatSessionDate, firstName } from "@/lib/payments";
import { PayPanel } from "./PayPanel";

export const dynamic = "force-dynamic";

// A private link for one client: keep it out of search and link previews.
export const metadata: Metadata = {
  title: "Your Payment | Hailey Brooke Photography",
  robots: { index: false, follow: false },
};

type Props = {
  params: { token: string };
  searchParams: { session_id?: string; canceled?: string };
};

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={strong ? "text-charcoal" : "text-medium-gray"}>{label}</dt>
      <dd className={`text-right ${strong ? "text-charcoal" : "text-charcoal/80"}`}>{value}</dd>
    </div>
  );
}

export default async function PayPage({ params, searchParams }: Props) {
  if (!isDbConfigured()) notFound();
  let booking = await prisma.booking.findUnique({ where: { paymentToken: params.token } });
  if (!booking) notFound();

  // Back from Stripe. Record the payment now rather than waiting on the
  // webhook, so the page can say "paid" the moment they land on it.
  let justPaid: { paidCents: number; tipCents: number } | null = null;
  let processing = false;
  if (searchParams.session_id && isStripeConfigured()) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(searchParams.session_id);
      // "complete" only: an abandoned or expired session in the URL is not a payment.
      if (
        session.status === "complete" &&
        session.metadata?.purpose === "final-payment" &&
        session.metadata.bookingId === booking.id
      ) {
        const result = await recordFinalPayment(session);
        if (result === "pending") processing = true;
        else if (result === "recorded" || result === "already-recorded" || result === "duplicate") {
          const paidCents = session.amount_total ?? 0;
          justPaid = { paidCents, tipCents: Math.max(0, paidCents - Number(session.metadata.dueCents || 0)) };
          booking = (await prisma.booking.findUnique({ where: { id: booking.id } })) ?? booking;
        }
      }
    } catch (err) {
      console.error("Pay page: could not load checkout session", err);
    }
  }

  const name = firstName(booking.fullName);
  const isSession = booking.kind === "session";
  const dueCents = amountDueCents(booking);
  const hasPaidPart = booking.deposit > 0 && booking.depositPaid;
  const when = [formatSessionDate(booking.sessionDate), booking.sessionTime].filter(Boolean).join(" · ");

  const summary = (
    <dl className="space-y-3 text-sm">
      <Row label={isSession ? "Session" : "For"} value={booking.sessionType} />
      {booking.packageName && <Row label="Package" value={booking.packageName} />}
      {when && <Row label="Date" value={when} />}
    </dl>
  );

  // ---- Paid (just now, or earlier) ----
  if (booking.paidInFull || justPaid) {
    const tipCents = justPaid?.tipCents ?? booking.tipCents;
    return (
      <Shell>
        <div className="text-center">
          <div className="w-14 h-14 bg-olive/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-7 h-7 text-olive" />
          </div>
          <h1 className="section-title text-3xl md:text-4xl mb-4">
            {justPaid ? "Thank you!" : "All paid"}
          </h1>
          <p className="text-medium-gray max-w-md mx-auto">
            {justPaid
              ? `Thank you, ${name} — your payment of ${formatCents(justPaid.paidCents)} went through and you're all paid in full.`
              : `You're all paid in full, ${name}. Thank you!`}
            {tipCents > 0 && ` And thank you so much for the ${formatCents(tipCents)} tip — it truly means a lot.`}
          </p>
          {justPaid && (
            <p className="text-sm text-medium-gray mt-4">A receipt is on its way to your email.</p>
          )}
        </div>
        <div className="border-t border-beige mt-8 pt-6">{summary}</div>
        <div className="mt-8 text-center">
          <Link href="/" className="btn-olive">
            Back to Home
          </Link>
        </div>
      </Shell>
    );
  }

  // ---- Bank payment still clearing ----
  if (processing) {
    return (
      <Shell>
        <div className="text-center">
          <div className="w-14 h-14 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-7 h-7 text-gold-dark" />
          </div>
          <h1 className="section-title text-3xl md:text-4xl mb-4">Payment processing</h1>
          <p className="text-medium-gray max-w-md mx-auto">
            Thank you, {name}! Your payment is on its way. Bank payments can take a few business
            days to clear, and you&apos;ll get an email as soon as it does. There&apos;s nothing
            else you need to do.
          </p>
        </div>
      </Shell>
    );
  }

  // ---- Ready to pay ----
  return (
    <Shell>
      <p className="text-sm text-medium-gray mb-2">Hi {name},</p>
      <h1 className="section-title text-3xl md:text-4xl mb-4">
        {isSession ? "Your final payment" : "Your payment"}
      </h1>
      <span className="rule-gold mb-8" />

      {searchParams.canceled && (
        <div className="bg-warning/10 border border-warning/30 text-charcoal rounded-md p-3 text-sm mb-6">
          Payment was cancelled and nothing was charged. You can try again whenever you&apos;re
          ready.
        </div>
      )}

      {summary}

      <div className="border-t border-beige mt-6 pt-6">
        <dl className="space-y-3 text-sm mb-8">
          {hasPaidPart && (
            <>
              <Row label={isSession ? "Session total" : "Total"} value={formatCents(booking.total * 100)} />
              <Row label={isSession ? "Deposit paid" : "Already paid"} value={`− ${formatCents(booking.deposit * 100)}`} />
            </>
          )}
          <Row label={hasPaidPart ? "Remaining balance" : "Amount due"} value={formatCents(dueCents)} strong />
        </dl>

        <PayPanel
          token={params.token}
          dueCents={dueCents}
          booking={{
            total: booking.total,
            balance: booking.balance,
            paidInFull: booking.paidInFull,
            tipEnabled: booking.tipEnabled,
          }}
        />
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-off-white">
      <section className="section-padding">
        <div className="container-custom max-w-xl">
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-10">{children}</div>
          <p className="text-xs text-medium-gray text-center mt-6">
            Questions? Reply to your email or call{" "}
            <a href="tel:502-837-0871" className="text-olive hover:underline">
              502-837-0871
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
