import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement | Hailey Brooke Photography",
  description:
    "Hailey Brooke Photography's commitment to making its website accessible to everyone, including people with disabilities.",
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

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-off-white">
      <section className="section-padding bg-cream">
        <div className="container-custom text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal mb-4">
            Accessibility Statement
          </h1>
          <p className="text-medium-gray">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-3xl space-y-10">
          <p className="text-medium-gray leading-relaxed">
            Hailey Brooke Photography is committed to ensuring that our website is accessible to
            everyone, including people with disabilities. We want every visitor to be able to view our
            work and book a session with ease, and we are continually working to improve the experience
            for all users.
          </p>

          <Section title="Our Commitment">
            <p>
              We strive to provide a website that is usable by the widest possible audience, regardless
              of ability or technology. We consider accessibility an ongoing effort and regularly review
              our site as we add new features and content.
            </p>
          </Section>

          <Section title="Conformance Standard">
            <p>
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA, which
              are recognized internationally and align with the standards referenced under the Americans
              with Disabilities Act (ADA). These guidelines explain how to make web content more
              accessible to people with a wide range of disabilities.
            </p>
          </Section>

          <Section title="Measures We Take">
            <ul className="list-disc pl-6 space-y-1">
              <li>Descriptive alternative text for meaningful images.</li>
              <li>Sufficient color contrast for text and interactive elements.</li>
              <li>Keyboard-navigable menus, forms, and buttons.</li>
              <li>Clear, consistent page structure and headings.</li>
              <li>Labels and accessible names on form fields and controls.</li>
              <li>Responsive layouts that work across devices and zoom levels.</li>
            </ul>
          </Section>

          <Section title="Compatibility">
            <p>
              Our website is designed to work with current versions of major browsers (such as Chrome,
              Safari, Firefox, and Edge) and common assistive technologies, including screen readers.
              Using the most up-to-date versions provides the best experience.
            </p>
          </Section>

          <Section title="Ongoing Effort &amp; Limitations">
            <p>
              Despite our efforts, some content may not yet be fully accessible. Accessibility is an
              ongoing process, and we are actively working to identify and resolve any issues. If you
              encounter a barrier, please let us know so we can address it and provide the information
              you need in an alternative format where possible.
            </p>
          </Section>

          <Section title="Feedback &amp; Contact">
            <p>
              We welcome your feedback on the accessibility of our website. If you experience any
              difficulty, or need assistance accessing any part of our site or services, please contact
              us and we will be glad to help:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Email:{" "}
                <a
                  href="mailto:haileybrookephotography@outlook.com"
                  className="text-dusty-rose hover:underline"
                >
                  haileybrookephotography@outlook.com
                </a>
              </li>
              <li>Phone: (502) 837-0871</li>
            </ul>
            <p>
              We aim to respond to accessibility feedback within 3–5 business days.
            </p>
          </Section>
        </div>
      </section>
    </main>
  );
}
