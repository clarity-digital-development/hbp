import Image from "next/image";
import Link from "next/link";
import type { Tier } from "@/lib/packages";

/**
 * Shared pieces for the two pricing pages. These pages deliberately run a
 * softer type pairing than the rest of the site — Cormorant, Parisienne and
 * EB Garamond — matching the designs Hailey supplied. The palette stays on the
 * site system (off-white ground, olive, gold) rather than the mock's cream.
 */

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.75rem] uppercase text-olive-dark mb-4" style={{ letterSpacing: "0.32em" }}>
      {children}
    </p>
  );
}

export function Sprig() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/sprig.svg"
      alt=""
      aria-hidden="true"
      className="block w-[16rem] max-w-[70%] h-auto mx-auto mb-9"
    />
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display font-medium text-center text-olive-dark text-[1.95rem] leading-tight mb-11">
      {children}
    </h2>
  );
}

export function TierRow({ tier }: { tier: Tier }) {
  return (
    <div className="py-7 border-t border-beige last:border-b transition-colors hover:bg-olive-tint/40">
      {tier.image && (
        <div className="border-2 border-gold p-2 sm:p-2.5 mb-6">
          <div className="relative aspect-[3/2] w-full overflow-hidden">
            <Image
              src={tier.image}
              alt={tier.alt ?? ""}
              fill
              quality={84}
              className="object-cover"
              sizes="(max-width: 800px) 100vw, 760px"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 mb-2.5">
        <h3 className="font-flourish text-[2.1rem] leading-tight text-charcoal">{tier.name}</h3>
        <p className="sm:text-right whitespace-nowrap">
          {tier.from && (
            <span className="block font-reading italic text-[0.78rem] text-medium-gray -mb-0.5">
              starting at
            </span>
          )}
          <span className="font-medium text-base text-olive-dark">{tier.price}</span>
        </p>
      </div>

      <p className="font-reading text-[1.06rem] leading-relaxed text-medium-gray max-w-[58ch]">
        {tier.description}
      </p>
    </div>
  );
}

export function AddOnNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-reading italic text-[0.97rem] text-medium-gray max-w-[52ch] mx-auto mt-8 pt-7 border-t border-beige text-center">
      {children}
    </p>
  );
}

export function PricingFooter({
  href,
  label,
  note,
}: {
  href: string;
  label: string;
  note: string;
}) {
  return (
    <footer className="text-center pt-14 pb-20">
      <Link
        href={href}
        className="btn-olive inline-block"
      >
        {label}
      </Link>
      <p className="font-reading text-[0.9rem] text-medium-gray mt-5">{note}</p>
    </footer>
  );
}
