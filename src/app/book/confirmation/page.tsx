import Link from "next/link";
import { Check } from "lucide-react";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-medium-gray">{label}</dt>
      <dd className="text-charcoal text-right">{value}</dd>
    </div>
  );
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let m: Record<string, string> = {};
  let email: string | null = null;
  let paid = false;

  if (session_id && isStripeConfigured()) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      m = (session.metadata as Record<string, string>) || {};
      email = session.customer_details?.email ?? null;
      paid = session.payment_status === "paid";
    } catch {
      // fall through to the generic confirmation
    }
  }

  const firstName = m.fullName ? m.fullName.split(" ")[0] : "";

  return (
    <main className="min-h-screen bg-off-white">
      <section className="section-padding">
        <div className="container-custom max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-sage-dark" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-charcoal mb-3">
              {paid ? "Booking confirmed!" : "Thank you!"}
            </h1>
            <p className="text-medium-gray mb-8 max-w-md mx-auto">
              {firstName ? `Thank you, ${firstName}! ` : ""}
              {paid
                ? "Your deposit is paid and your date is reserved. "
                : "Your request has been received. "}
              I&apos;ll reach out shortly to confirm the details.
              {m.balance && (
                <>
                  {" "}
                  You&apos;ll receive a secure link to pay your remaining balance of ${m.balance}{" "}
                  before your session.
                </>
              )}
            </p>

            {(m.sessionType || m.date) && (
              <div className="text-left border-t border-beige pt-6 mt-6">
                <dl className="space-y-3 text-sm">
                  <Row label="Session" value={m.sessionType} />
                  <Row label="Package" value={m.packageName} />
                  <Row label="Date" value={m.date} />
                  <Row label="Time" value={m.time} />
                  {m.prints && <Row label="Prints" value={m.prints} />}
                  <Row label="Deposit paid" value={m.deposit ? `$${m.deposit}` : undefined} />
                  <Row label="Balance due at session" value={m.balance ? `$${m.balance}` : undefined} />
                  {email && <Row label="Confirmation sent to" value={email} />}
                </dl>
              </div>
            )}

            <div className="mt-8">
              <Link href="/" className="btn-sage-dark inline-block">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
