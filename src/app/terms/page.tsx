import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Hailey Brooke Photography",
  description:
    "The terms governing photography sessions, bookings, payments, and image use with Hailey Brooke Photography.",
};

const LAST_UPDATED = "May 27, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-charcoal mb-3">{title}</h2>
      <div className="space-y-3 text-medium-gray leading-relaxed">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-off-white">
      <section className="section-padding bg-cream">
        <div className="container-custom text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-medium-gray">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-3xl space-y-10">
          <p className="text-medium-gray leading-relaxed">
            These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of the Hailey Brooke
            Photography website and the photography services we provide. By booking a session or using
            this site, you agree to these Terms. A separate session agreement may apply to your specific
            booking; where it conflicts with these Terms, the signed session agreement controls.
          </p>

          <Section title="1. Services">
            <p>
              Hailey Brooke Photography provides portrait, couples, family, branding, maternity,
              engagement, and related photography services. Weddings and other complex sessions are
              arranged by custom quote and require a consultation before booking.
            </p>
          </Section>

          <Section title="2. Booking &amp; Retainer">
            <p>
              A non-refundable retainer of 30% of the session total is required to reserve your date.
              Your booking is not confirmed until the retainer is received. The retainer is applied
              toward your total and reserves the date and time exclusively for you.
            </p>
          </Section>

          <Section title="3. Remaining Balance">
            <p>
              The remaining balance is due by the date stated at booking (and no later than the day of
              your session, unless otherwise agreed in writing). We may send a secure invoice for the
              balance, payable online.
            </p>
          </Section>

          <Section title="4. No-Shows">
            <p>
              If you do not attend your scheduled session and do not notify us of the reason, the card
              on file may be charged the remaining balance of the session cost. We encourage you to
              communicate with us as early as possible if plans change.
            </p>
          </Section>

          <Section title="5. Rescheduling &amp; Cancellations">
            <p>
              We understand that life happens. If you need to reschedule, please contact us as soon as
              possible and we will do our best to accommodate a new date. The retainer is
              non-refundable but may, at our discretion, be applied to a rescheduled session. Sessions
              affected by weather are generally rebooked the day of.
            </p>
          </Section>

          <Section title="6. Payments">
            <p>
              Payments are processed securely through Stripe. By providing payment information, you
              authorize the applicable charges, including the retainer at booking and the remaining
              balance as described above.
            </p>
          </Section>

          <Section title="7. Copyright &amp; Image Use">
            <p>
              Hailey Brooke Photography retains the copyright to all images created during your session.
              Upon final payment, you receive a personal-use license to the delivered digital images as
              described in your chosen package, which allows you to print and share them for personal,
              non-commercial purposes. Commercial use requires prior written permission.
            </p>
            <p>
              We may use images from your session to promote our work unless you opt out in writing
              before the session.
            </p>
          </Section>

          <Section title="8. Image Delivery">
            <p>
              Edited images are typically delivered within 1–3 weeks via a private online gallery.
              Delivery times may vary during peak seasons. We do not provide unedited or RAW files.
            </p>
          </Section>

          <Section title="9. Client Responsibilities">
            <p>
              You agree to arrive on time, communicate any special needs in advance, and treat the
              photographer and any assistants with respect. You are responsible for obtaining any
              permits or permissions required for your chosen location.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              In the unlikely event of equipment failure, illness, or other circumstances beyond our
              reasonable control that prevent delivery of the session, our liability is limited to a
              refund of amounts paid for the affected session. We are not liable for indirect or
              consequential damages.
            </p>
          </Section>

          <Section title="11. Force Majeure">
            <p>
              We are not responsible for failure to perform due to events beyond our reasonable control,
              including illness, natural disasters, or other emergencies. In such cases we will work
              with you to reschedule.
            </p>
          </Section>

          <Section title="12. Privacy">
            <p>
              Your information is handled in accordance with our{" "}
              <a href="/privacy" className="text-dusty-rose hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </Section>

          <Section title="13. Governing Law">
            <p>
              These Terms are governed by the laws of the Commonwealth of Kentucky, without regard to
              its conflict-of-laws principles.
            </p>
          </Section>

          <Section title="14. Changes to These Terms">
            <p>
              We may update these Terms from time to time. The &quot;Last updated&quot; date reflects
              the most recent revision. Your continued use of our services after changes take effect
              constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="15. Contact Us">
            <p>
              Questions about these Terms? Contact us at{" "}
              <a
                href="mailto:haileybrookephotography@outlook.com"
                className="text-dusty-rose hover:underline"
              >
                haileybrookephotography@outlook.com
              </a>{" "}
              or (502) 837-0871.
            </p>
          </Section>
        </div>
      </section>
    </main>
  );
}
