import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { galleries } from "@/lib/galleries";

export const metadata: Metadata = {
  title: "Portfolio | Hailey Brooke Photography",
  description:
    "Wedding, couples, portrait and brand photography across Kentucky — a look at recent work.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return (
    <div className="bg-off-white">
      <div className="max-w-[47.5rem] mx-auto px-7 pb-20">
        <header className="text-center pt-16">
          <p className="nav-title text-[0.7rem] sm:text-xs text-olive-dark mb-4">Portfolio</p>
          <h1 className="font-display font-medium text-charcoal text-[clamp(2rem,5vw,2.6rem)] leading-tight">
            A look at the work
          </h1>
          <p className="font-reading italic text-medium-gray mt-3">
            Real moments, gently captured.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/crest.svg"
            alt=""
            aria-hidden="true"
            className="block w-[6.5rem] max-w-[30%] h-auto mx-auto mt-7"
          />
        </header>

        <div className="pt-14">
          {galleries.map((g, i) => (
            <Link
              key={g.slug}
              href={`/portfolio/${g.slug}`}
              className="group block mb-16 no-underline"
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden border border-gold bg-mist">
                <Image
                  src={g.cover}
                  alt={`${g.title} — cover`}
                  fill
                  quality={84}
                  priority={i === 0}
                  className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.035]"
                  sizes="(max-width: 47.5rem) calc(100vw - 3.5rem), 704px"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-[rgba(38,42,28,0.30)] to-transparent to-55%" />
              </div>

              <div className="text-center mt-5">
                <h2 className="font-flourish text-[2rem] sm:text-[2.4rem] leading-tight text-charcoal">
                  {g.title}
                </h2>
                <p className="font-reading italic text-[0.97rem] text-medium-gray mt-1">
                  {g.note}
                </p>
                <span className="inline-block nav-title text-[0.68rem] text-olive-dark mt-3 pb-1 border-b border-gold">
                  View gallery
                </span>
              </div>
            </Link>
          ))}
        </div>

        <footer className="text-center pt-4">
          <Link href="/contact?service=Wedding" className="btn-olive">
            Inquire about your date
          </Link>
          <p className="font-reading text-[0.9rem] text-medium-gray mt-5">
            Booking a limited number of weddings each season.
          </p>
        </footer>
      </div>
    </div>
  );
}
