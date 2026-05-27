"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const STUDIO_RATE_PER_45 = 70;
const SESSION_RATE_PER_45 = 100;

function priceFor(minutes: number) {
  const studio = Math.round((STUDIO_RATE_PER_45 * minutes) / 45);
  const session = Math.round((SESSION_RATE_PER_45 * minutes) / 45);
  return { studio, session, total: studio + session };
}

const tiers = [
  { minutes: 30, label: "30 Minutes", description: "Quick portrait set or branded headshots" },
  { minutes: 60, label: "1 Hour", description: "Full portrait session with outfit changes" },
  { minutes: 90, label: "90 Minutes", description: "Extended session — multiple looks, more variety" },
];

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

export default function StudioPage() {
  const [selectedMinutes, setSelectedMinutes] = useState(60);
  const selectedPrice = priceFor(selectedMinutes);

  return (
    <main className="min-h-screen bg-off-white">
      {/* Hero */}
      <section className="section-padding bg-cream">
        <div className="container-custom text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal mb-6"
          >
            Studio Sessions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-medium-gray text-lg max-w-2xl mx-auto"
          >
            Pick the session length that fits your shoot. Studio pricing is added on top of the
            standard session fee.
          </motion.p>
        </div>
      </section>

      {/* Tiers */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-4">
              Choose your time
            </h2>
            <p className="text-medium-gray max-w-xl mx-auto">
              All studio sessions include the space rental plus the photography session fee.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {tiers.map((tier, idx) => {
              const price = priceFor(tier.minutes);
              const isSelected = selectedMinutes === tier.minutes;
              return (
                <motion.button
                  key={tier.minutes}
                  type="button"
                  onClick={() => setSelectedMinutes(tier.minutes)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.08 }}
                  className={`text-left bg-white rounded-lg p-8 shadow-sm transition-all duration-300 ${
                    isSelected
                      ? "ring-2 ring-sage-dark shadow-md -translate-y-1"
                      : "hover:shadow-md hover:-translate-y-1"
                  }`}
                >
                  <h3 className="font-display text-2xl text-charcoal mb-1">{tier.label}</h3>
                  <p className="text-sm text-medium-gray mb-6">{tier.description}</p>
                  <div className="space-y-2 text-sm text-medium-gray mb-4">
                    <div className="flex justify-between">
                      <span>Studio</span>
                      <span>${price.studio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Session</span>
                      <span>${price.session}</span>
                    </div>
                  </div>
                  <div className="border-t border-beige pt-4 flex justify-between items-baseline">
                    <span className="font-display text-lg text-charcoal">Total</span>
                    <span className="font-display text-3xl text-mauve">${price.total}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Booking CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 bg-blush-light rounded-lg p-8 text-center"
          >
            <p className="text-medium-gray mb-2">Selected session</p>
            <p className="font-display text-2xl text-charcoal mb-1">
              {formatDuration(selectedMinutes)} — ${selectedPrice.total}
            </p>
            <p className="text-sm text-medium-gray mb-6">
              ${selectedPrice.studio} studio + ${selectedPrice.session} session
            </p>
            <Link
              href={`/contact?service=Studio%20Session&duration=${selectedMinutes}&total=${selectedPrice.total}`}
              className="btn-sage-dark inline-block"
            >
              Book This Session
            </Link>
            <p className="text-xs text-medium-gray mt-4">
              A 30% non-refundable retainer is due at booking.
            </p>
          </motion.div>

          <div className="mt-10 text-center">
            <Link href="/investment" className="text-sm text-medium-gray hover:text-charcoal transition-colors">
              ← Back to pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
