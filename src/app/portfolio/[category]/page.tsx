import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Gallery } from "@/components/portfolio/Gallery";
import { galleries, galleryBySlug, nextGallery } from "@/lib/galleries";

type Params = { params: { category: string } };

// Only the three real slugs exist; anything else should 404 at the edge rather
// than render a page and cache the miss.
export const dynamicParams = false;

export function generateStaticParams() {
  return galleries.map((g) => ({ category: g.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const g = galleryBySlug(params.category);
  if (!g) return {};
  // ?v= changes whenever a card's image does, so apps that cache previews by
  // URL (Facebook especially) fetch the new one.
  const card = `/og/portfolio-${g.slug}.jpg?v=2`;
  return {
    title: `${g.title} | Hailey Brooke Photography`,
    description: `${g.note}. ${g.description}`,
    alternates: { canonical: `/portfolio/${g.slug}` },
    openGraph: {
      images: [{ url: card, width: 1200, height: 630, alt: `${g.title} by Hailey Brooke Photography` }],
    },
    twitter: { card: "summary_large_image", images: [card] },
  };
}

export default function GalleryPage({ params }: Params) {
  const g = galleryBySlug(params.category);
  if (!g) notFound();
  const next = nextGallery(g.slug);

  return (
    <div className="bg-off-white">
      <div className="max-w-[47.5rem] mx-auto px-7 pb-20">
        <header className="text-center pt-16">
          <p className="nav-title text-[0.7rem] sm:text-xs text-olive-dark mb-4">Portfolio</p>
          <h1 className="font-display font-medium text-charcoal text-[clamp(2rem,5vw,2.6rem)] leading-tight">
            {g.title}
          </h1>
          <p className="font-reading italic text-medium-gray mt-3">{g.note}</p>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 nav-title text-[0.68rem] text-medium-gray hover:text-olive-dark transition-colors mt-8 pb-1 border-b border-transparent hover:border-gold"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            All galleries
          </Link>
        </header>

        <div className="pt-12">
          <Gallery slides={g.slides} />
        </div>

        <div className="text-center pt-14">
          <Link
            href={`/portfolio/${next.slug}`}
            className="font-display italic text-lg text-olive-dark hover:text-olive transition-colors"
          >
            Next — {next.title} ›
          </Link>
        </div>

        <footer className="text-center pt-10">
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
