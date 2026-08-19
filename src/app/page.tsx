"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const heroImage = "/images/hero-hailey.jpg";

// Illustrated florals from the save-the-date artwork, split out of the original
// SVG. Their line work is #757A3B — the same olive as the header. Positioned to
// break the gold frame at opposite corners, echoing the original composition.
const heroOverlays = [
  {
    src: "/images/vector-tulips.svg",
    className:
      "w-20 sm:w-28 lg:w-36 -top-8 -left-9 sm:-left-12 lg:-top-14 lg:-left-20",
  },
  {
    src: "/images/vector-candelabra.svg",
    className:
      "w-14 sm:w-[4.5rem] lg:w-24 -bottom-8 -right-7 sm:-right-9 lg:-bottom-11 lg:-right-14",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * The homepage is a single locked screen — it fills the viewport below the
 * header and never scrolls. Every other destination lives behind the nav, so
 * there is nothing here to scroll toward. `dvh` keeps it honest on mobile,
 * where `vh` would otherwise sit under the browser chrome.
 */
export default function Home() {
  return (
    <section className="h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-5rem)] overflow-hidden bg-off-white">
      <div className="container-custom h-full flex items-center">
        <div className="w-full lg:w-auto lg:mx-auto grid grid-cols-1 lg:grid-cols-[auto_auto] gap-8 sm:gap-10 lg:gap-16 xl:gap-24 items-center justify-items-center lg:justify-items-start">
          {/* Framed portrait — height-driven on desktop so it can never
              outgrow the locked viewport, width-driven on mobile. */}
          <motion.div
            className="relative shrink-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="p-1.5 sm:p-2 border border-gold">
              <div className="relative aspect-[2/3] w-[min(66vw,17rem)] sm:w-[18rem] lg:w-auto lg:h-[min(70vh,37.5rem)] overflow-hidden">
                <Image
                  quality={90}
                  src={heroImage}
                  alt="Hailey Brooke, Kentucky wedding and portrait photographer"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 60vw, 24vw"
                />
              </div>
            </div>

            {/* Decorative only — plain <img> keeps these as raw SVG rather than
                routing them through the image optimizer. */}
            {heroOverlays.map((overlay) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={overlay.src}
                src={overlay.src}
                alt=""
                aria-hidden="true"
                className={`pointer-events-none select-none absolute z-10 h-auto ${overlay.className}`}
              />
            ))}
          </motion.div>

          {/* Headline */}
          <motion.div
            className="text-center lg:text-left"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.p
              className="nav-title text-xs sm:text-sm text-olive-dark mb-5 sm:mb-7"
              variants={fadeInUp}
            >
              Kentucky Wedding &amp; Portrait Photographer
            </motion.p>
            <motion.h1
              className="section-title text-[2.1rem] sm:text-5xl lg:text-6xl xl:text-7xl mb-8 sm:mb-10"
              variants={fadeInUp}
            >
              <span className="block">Your story,</span>
              <span className="block">beautifully told</span>
            </motion.h1>
            <motion.div
              className="flex flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
              variants={fadeInUp}
            >
              <Link href="/book" className="btn-olive text-center">
                Book Now
              </Link>
              <Link href="/portfolio" className="btn-olive-outline text-center">
                Portfolio
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
