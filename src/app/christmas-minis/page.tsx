import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Eyebrow, SectionTitle, Sprig } from "@/components/pricing";
import { isDbConfigured } from "@/lib/db";
import { CHRISTMAS_MINIS as MINI, miniSlotIsPast } from "@/lib/minis";
import { takenMiniTimes } from "@/lib/mini-slots";
import { formatSessionDate } from "@/lib/payments";
import { MiniBookingForm, type MiniSlot } from "./MiniBookingForm";

// Slots fill up as people book, so the page is rendered per request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Christmas Minis | Hailey Brooke Photography",
  description:
    "Outdoor Christmas mini sessions in Lexington, Kentucky on Saturday, November 21. 15 minutes, 10 photos, $95 — with hot chocolate.",
  alternates: { canonical: "/christmas-minis" },
  openGraph: {
    images: [{ url: "/og/christmas-minis-card.jpg", width: 1200, height: 630, alt: "Christmas Minis with Hailey Brooke Photography — Saturday, Nov 21 in Lexington, KY, $95" }],
  },
  twitter: { card: "summary_large_image", images: ["/og/christmas-minis-card.jpg"] },
};

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.7rem] uppercase text-medium-gray mb-1" style={{ letterSpacing: "0.2em" }}>
        {label}
      </dt>
      <dd className="font-reading text-[1.06rem] text-charcoal">{children}</dd>
    </div>
  );
}

export default async function ChristmasMinisPage() {
  const now = new Date();
  let taken = new Set<string>();
  if (isDbConfigured()) {
    try {
      taken = await takenMiniTimes(now);
    } catch (err) {
      console.error("Christmas minis: could not load booked times", err);
    }
  }
  const slots: MiniSlot[] = MINI.times.map((time) => ({
    time,
    open: !taken.has(time) && !miniSlotIsPast(time, now),
  }));
  const wrapped = MINI.times.every((t) => miniSlotIsPast(t, now));
  const soldOut = !wrapped && slots.every((s) => !s.open);

  return (
    <div className="bg-off-white">
      <div className="max-w-[47.5rem] mx-auto px-7">
        {/* Intro */}
        <section className="text-center pt-16 pb-4 flex flex-col items-center">
          <Eyebrow>Holiday Minis</Eyebrow>
          <h1 className="font-display font-medium text-charcoal text-[clamp(2rem,5vw,2.6rem)] leading-tight mb-9">
            Christmas Minis
          </h1>

          {/* Portrait, matching Hailey's photo of the set. */}
          <div className="w-full max-w-[26rem] border-2 border-gold p-2 sm:p-2.5 mb-8">
            <div className="relative w-full aspect-[3/4] overflow-hidden">
              <Image
                src="/images/christmas-minis-setup.jpg"
                alt="The Christmas mini set: a white bench with a red velvet cushion and garland, between two frosted trees hung with red and gold ornaments"
                fill
                priority
                quality={84}
                className="object-cover"
                sizes="(max-width: 480px) 100vw, 416px"
              />
            </div>
          </div>

          <p className="font-display italic text-[clamp(1.3rem,3.2vw,1.7rem)] leading-[1.5] text-charcoal max-w-[30ch] mx-auto">
            Come join us for some Christmas photo fun and some yummy hot chocolate!
          </p>
        </section>

        {/* The session */}
        <section className="pt-10">
          <Sprig />
          <div className="py-7 border-t border-b border-beige">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 mb-2.5">
              <h2 className="font-flourish text-[2.1rem] leading-tight text-charcoal">Christmas Mini</h2>
              <p className="font-medium text-base text-olive-dark">${MINI.price}</p>
            </div>
            <p className="font-reading text-[1.06rem] leading-relaxed text-medium-gray max-w-[58ch] mb-6">
              A {MINI.minutes}-minute outdoor session on our Christmas set, with {MINI.photos} photos
              back. Pay in full when you book, or hold your spot with a ${MINI.deposit} deposit and
              pay the rest after your session.
            </p>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5">
              <Fact label="Date">{formatSessionDate(MINI.date)}</Fact>
              <Fact label="Location">{MINI.location}</Fact>
              <Fact label="Session">{MINI.minutes} minutes</Fact>
              <Fact label="Photos">{MINI.photos} photos</Fact>
            </dl>
          </div>
        </section>

        {/* Booking */}
        <section id="book" className="pt-14 pb-20 scroll-mt-24">
          <SectionTitle>Reserve your spot</SectionTitle>

          {wrapped ? (
            <div className="text-center">
              <p className="font-reading text-[1.06rem] text-medium-gray mb-6">
                Christmas minis have wrapped for this year. Thank you to everyone who came out!
              </p>
              <Link href="/sessions" className="btn-olive inline-block">
                See regular sessions
              </Link>
            </div>
          ) : soldOut ? (
            <div className="text-center">
              <p className="font-reading text-[1.06rem] text-medium-gray mb-6">
                Every spot is booked. If one opens up, I&apos;d love to fit you in — send me a
                message and I&apos;ll put you on the waitlist.
              </p>
              <Link href="/contact" className="btn-olive inline-block">
                Join the waitlist
              </Link>
            </div>
          ) : (
            <MiniBookingForm slots={slots} />
          )}

          <p className="font-reading text-[0.9rem] text-medium-gray text-center mt-10">
            Questions? Call or text{" "}
            <a href="tel:502-837-0871" className="text-olive hover:underline">
              502-837-0871
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
