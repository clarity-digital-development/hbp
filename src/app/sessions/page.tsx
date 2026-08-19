import type { Metadata } from "next";
import {
  AddOnNote,
  Eyebrow,
  PricingFooter,
  Sprig,
  TierRow,
} from "@/components/pricing";
import { addOnNote, sessionTiers } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Session Pricing | Hailey Brooke Photography",
  description:
    "Portrait, couples and family session pricing in Kentucky. Mini sessions and full sessions on location or in-studio.",
  alternates: { canonical: "/sessions" },
};

export default function SessionsPage() {
  return (
    <div className="bg-off-white">
      <div className="max-w-[47.5rem] mx-auto px-7">
        <section className="text-center pt-16 pb-2">
          <Eyebrow>Sessions</Eyebrow>
          <h1 className="font-display font-medium text-charcoal text-[clamp(2rem,5vw,2.6rem)] leading-tight mb-9">
            Standard Sessions
          </h1>
          <Sprig />
        </section>

        <section>
          {sessionTiers.map((tier) => (
            <TierRow key={tier.name} tier={tier} />
          ))}

          <AddOnNote>{addOnNote}</AddOnNote>
        </section>

        <PricingFooter
          href="/book"
          label="Book a session"
          note="A signed contract and retainer are required to reserve your date."
        />
      </div>
    </div>
  );
}
