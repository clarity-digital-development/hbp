import type { Metadata } from "next";
import Image from "next/image";
import {
  AddOnNote,
  Eyebrow,
  PricingFooter,
  SectionTitle,
  Sprig,
  TierRow,
} from "@/components/pricing";
import { addOnNote, weddingTiers } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Wedding Photography Pricing | Hailey Brooke Photography",
  description:
    "Wedding and elopement photography across Kentucky. Coverage from intimate elopements to full ten-hour days, with a second shooter, album and Polaroids.",
  alternates: { canonical: "/weddings" },
};

export default function WeddingsPage() {
  return (
    <div className="bg-off-white">
      <div className="max-w-[47.5rem] mx-auto px-7">
        {/* Intro */}
        <section className="text-center pt-16 pb-4 flex flex-col items-center">
          <Eyebrow>Weddings</Eyebrow>

          {/* Landscape, matching the frame Hailey shot — the source image is 3:2. */}
          <div className="w-full border-2 border-gold p-2 sm:p-2.5 mb-8">
            <div className="relative w-full aspect-[3/2] overflow-hidden">
              <Image
                src="/images/wedding-hero.jpg"
                alt="Bride and groom sharing a kiss beside the water"
                fill
                priority
                quality={90}
                className="object-cover"
                sizes="(max-width: 800px) 100vw, 760px"
              />
            </div>
          </div>

          <p className="font-display italic text-[clamp(1.3rem,3.2vw,1.7rem)] leading-[1.5] text-charcoal max-w-[30ch] mx-auto">
            Every wedding has its own rhythm — I&apos;m just there to catch it, unposed and
            real, from the first look to the last dance.
          </p>
        </section>

        {/* Pricing */}
        <section id="pricing" className="pt-10 scroll-mt-24">
          <Sprig />
          <SectionTitle>Coverage for every kind of day</SectionTitle>

          {weddingTiers.map((tier) => (
            <TierRow key={tier.name} tier={tier} />
          ))}

          <AddOnNote>{addOnNote}</AddOnNote>
        </section>

        <PricingFooter
          href="/contact?service=Wedding"
          label="Inquire about your date"
          note="Every package includes a signed contract and a retainer to hold your date."
        />
      </div>
    </div>
  );
}
