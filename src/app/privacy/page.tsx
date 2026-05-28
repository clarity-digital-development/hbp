import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Hailey Brooke Photography",
  description:
    "How Hailey Brooke Photography collects, uses, and protects your personal information.",
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

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-off-white">
      <section className="section-padding bg-cream">
        <div className="container-custom text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal mb-4">
            Privacy Policy
          </h1>
          <p className="text-medium-gray">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-3xl space-y-10">
          <p className="text-medium-gray leading-relaxed">
            Hailey Brooke Photography (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects
            your privacy. This Privacy Policy explains what information we collect when you visit our
            website or book a session, how we use it, and the choices you have. By using this site or
            our services, you agree to the practices described below.
          </p>

          <Section title="1. Information We Collect">
            <p>We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong className="text-charcoal">Contact &amp; inquiry details:</strong> name, email
                address, phone number, session type, preferred date, and the contents of your message.
              </li>
              <li>
                <strong className="text-charcoal">Booking details:</strong> the package and add-ons you
                select, session date and location, and any notes you share.
              </li>
              <li>
                <strong className="text-charcoal">Payment information:</strong> processed securely by
                our payment provider (Stripe). We do not collect or store your full card number.
              </li>
              <li>
                <strong className="text-charcoal">Automatically collected data:</strong> basic technical
                information such as IP address, browser type, and pages visited, which may be gathered
                through standard server logs and any analytics tools we use.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-6 space-y-1">
              <li>To respond to inquiries and communicate with you about your session.</li>
              <li>To schedule, fulfill, and manage your booking.</li>
              <li>To process deposits and payments and to send invoices for any remaining balance.</li>
              <li>To deliver your photographs and online gallery.</li>
              <li>To improve our website and services.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </Section>

          <Section title="3. Payment Processing">
            <p>
              Payments are handled by Stripe, Inc. Your card details are entered on Stripe&apos;s secure
              systems and are never stored on our servers. Stripe&apos;s handling of your data is governed
              by its own privacy policy, available at{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dusty-rose hover:underline"
              >
                stripe.com/privacy
              </a>
              .
            </p>
          </Section>

          <Section title="4. How We Share Information">
            <p>
              We do not sell your personal information. We share it only with trusted service providers
              who help us operate our business — for example, our payment processor (Stripe), email and
              hosting providers — and only to the extent needed to provide our services. We may also
              disclose information when required by law or to protect our legal rights.
            </p>
          </Section>

          <Section title="5. Use of Your Images">
            <p>
              As a photography business, we may use images created during your session to promote our
              work — for example, in our portfolio, on social media, or in advertising — unless you
              request otherwise in writing. Specific image-usage terms are set out in your session
              agreement. If you would like to opt out of promotional use, please let us know before
              your session.
            </p>
          </Section>

          <Section title="6. Cookies &amp; Analytics">
            <p>
              Our website may use cookies and similar technologies to keep the site functioning and to
              understand how visitors use it. You can control cookies through your browser settings;
              disabling them may affect some features.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We keep personal information for as long as needed to provide our services, maintain
              business records, and comply with legal obligations. You may request deletion of your
              information as described below.
            </p>
          </Section>

          <Section title="8. Your Rights &amp; Choices">
            <p>
              Depending on your location, you may have the right to access, correct, or delete the
              personal information we hold about you, or to object to certain uses. To make a request,
              contact us using the details below and we will respond in accordance with applicable law.
            </p>
          </Section>

          <Section title="9. Children&apos;s Privacy">
            <p>
              Our website is not directed to children under 13, and we do not knowingly collect their
              personal information. When we photograph minors, we do so with the consent of a parent or
              guardian.
            </p>
          </Section>

          <Section title="10. Data Security">
            <p>
              We take reasonable measures to protect your information. However, no method of
              transmission or storage is completely secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at
              the top reflects the most recent revision. Continued use of our site or services after
              changes take effect constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              If you have questions about this Privacy Policy or your information, contact us at{" "}
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
