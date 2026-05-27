"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const leftLinks = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/investment", label: "Pricing" },
];

const rightLinks = [
  { href: "/about", label: "About" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

const allLinks = [...leftLinks, ...rightLinks];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-sage-deep backdrop-blur-sm text-white shadow-md">
      <nav className="container-custom">
        {/* Desktop: 3-column grid (left links | centered logo | right links + CTA) */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center h-24 gap-8">
          <div className="flex items-center gap-8 justify-start">
            {leftLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-wider uppercase text-white hover:text-cream transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href="/"
            className="font-script text-4xl xl:text-5xl text-white leading-none whitespace-nowrap text-center"
          >
            Hailey Brooke Photography
          </Link>

          <div className="flex items-center gap-8 justify-end">
            {rightLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-wider uppercase text-white hover:text-cream transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book" className="btn-primary whitespace-nowrap ml-4 xl:ml-8">
              Book Now
            </Link>
          </div>
        </div>

        {/* Mobile: centered logo with menu button to the right */}
        <div className="lg:hidden grid grid-cols-[auto_1fr_auto] items-center h-20 gap-2 sm:gap-3">
          <div className="w-10" />
          <Link
            href="/"
            className="font-script text-2xl sm:text-3xl text-white leading-tight text-center whitespace-nowrap px-1"
          >
            Hailey Brooke Photography
          </Link>
          <button
            className="p-2 justify-self-end"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-sage-deep border-t border-white/20 overflow-hidden"
          >
            <div className="container-custom py-6 flex flex-col gap-4">
              {allLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-display text-white py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/book"
                className="btn-primary text-center mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
