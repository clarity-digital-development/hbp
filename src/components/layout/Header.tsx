"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Facebook, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Homepage" },
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/investment", label: "Pricing" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll while the overlay is open, and allow Escape to close it.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-olive text-white">
        <nav className="container-custom">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 lg:h-20 gap-3">
            {/* Menu trigger */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2.5 justify-self-start py-2 text-white/90 hover:text-white transition-colors"
              aria-label="Open menu"
              aria-expanded={isOpen}
            >
              <Menu size={20} strokeWidth={1.5} />
              <span className="nav-title hidden sm:inline text-sm">Menu</span>
            </button>

            {/* Wordmark */}
            <Link
              href="/"
              className="font-script text-2xl sm:text-3xl lg:text-4xl leading-none whitespace-nowrap text-center px-1"
            >
              Hailey Brooke Photography
            </Link>

            {/* Persistent booking CTA */}
            <Link
              href="/book"
              className="nav-title justify-self-end text-xs sm:text-sm border border-white/70 px-3 sm:px-5 py-2 hover:bg-white hover:text-olive transition-colors whitespace-nowrap"
            >
              Book
              <span className="hidden sm:inline"> Now</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Full-screen overlay menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-off-white overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="fixed top-5 right-5 sm:top-7 sm:right-8 z-10 p-2 text-charcoal hover:text-olive transition-colors"
              aria-label="Close menu"
            >
              <X size={26} strokeWidth={1.25} />
            </button>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="min-h-full flex flex-col items-center justify-center px-6 py-10"
            >
              {/* Gold-framed wedding detail */}
              <div className="relative w-[100px] sm:w-[118px] shrink-0 p-1.5 border border-gold">
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                  <Image
                    src="/images/nav-shoes.jpg"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="118px"
                    priority
                  />
                </div>
              </div>

              <p className="nav-title mt-4 sm:mt-5 text-[0.7rem] sm:text-xs text-olive">
                Table of Contents
              </p>

              <ul className="mt-4 w-full max-w-md flex flex-col">
                {navLinks.map((link) => (
                  <li key={link.href} className="border-t border-beige last:border-b">
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="nav-title block text-center text-charcoal hover:text-olive transition-colors py-2 sm:py-2.5 text-xl sm:text-2xl"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href="/book"
                onClick={() => setIsOpen(false)}
                className="btn-olive mt-6"
              >
                Book a Session
              </Link>

              <div className="flex gap-6 mt-6 text-charcoal">
                <a
                  href="https://instagram.com/haileybrookephotos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-olive transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={19} strokeWidth={1.5} />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61566405617589"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-olive transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={19} strokeWidth={1.5} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
