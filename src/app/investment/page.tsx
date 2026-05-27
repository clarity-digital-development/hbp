"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const packages = [
  {
    name: "Essential",
    price: "$90",
    originalPrice: "$108",
    duration: "30 minutes",
    description: "Perfect for mini sessions and simple portraits",
    features: [
      "1 location",
      "15+ edited digital images",
      "Online gallery",
    ],
    popular: false,
  },
  {
    name: "Signature",
    price: "$150",
    originalPrice: "$180",
    duration: "60 minutes",
    description: "My most popular package",
    features: [
      "1 location",
      "30+ edited digital images",
      "Online gallery",
    ],
    popular: true,
  },
  {
    name: "Luxe",
    price: "$240",
    originalPrice: "$288",
    duration: "90 minutes",
    description: "The complete experience for milestone events",
    features: [
      "2 locations",
      "50+ edited digital images",
      "Online gallery",
      "2 8x10 prints shipped to you",
      "Styling guide",
    ],
    popular: false,
  },
];

export default function InvestmentPage() {
  return (
    <main className="min-h-screen bg-off-white">
      {/* Hero Section */}
      <section className="section-padding bg-cream">
        <div className="container-custom text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal mb-6"
          >
            Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-medium-gray text-lg max-w-2xl mx-auto"
          >
            Beautiful photography is an investment in memories that will last a lifetime.
          </motion.p>
        </div>
      </section>

      {/* Portrait & Family Packages */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-4">
              Portrait & Family Sessions
            </h2>
            <p className="text-medium-gray max-w-xl mx-auto">
              From individual portraits to full family gatherings, find the perfect package for your needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-white rounded-lg p-8 shadow-sm ${
                  pkg.popular ? "ring-2 ring-dusty-rose" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-dusty-rose text-white text-sm px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="font-display text-2xl text-charcoal mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-1">
                    <span className="text-lg font-body text-medium-gray/60 line-through decoration-1 decoration-medium-gray/50">
                      {pkg.originalPrice}
                    </span>
                    <span className="text-4xl font-display text-dusty-rose">{pkg.price}</span>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-taupe mb-2">{pkg.duration}</p>
                  <p className="text-medium-gray text-sm">{pkg.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center text-charcoal">
                      <svg
                        className="w-5 h-5 text-dusty-rose mr-3 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="/book"
                  className={`block text-center py-3 rounded-full transition-all duration-300 ${
                    pkg.popular ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  Book Now
                </a>
              </motion.div>
            ))}
          </div>

          {/* Studio Sessions CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 bg-blush-light rounded-lg p-8 md:p-12 text-center"
          >
            <h3 className="font-display text-2xl md:text-3xl text-charcoal mb-3">
              Looking for indoor sessions?
            </h3>
            <p className="text-medium-gray max-w-xl mx-auto mb-6">
              Book a studio session and pick exactly how much time you need. Studio time is added
              on top of standard session pricing.
            </p>
            <Link href="/studio" className="btn-sage-dark inline-block">
              Want Studio Shots?
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Wedding Inquiries */}
      <section className="section-padding bg-cream">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto bg-white rounded-lg p-8 md:p-12 shadow-sm text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-4">
              Weddings
            </h2>
            <p className="text-medium-gray mb-8">
              Every wedding is unique. Reach out with your date, venue, and a little about your day,
              and I&apos;ll put together a custom quote for you.
            </p>
            <Link href="/contact?service=Wedding" className="btn-primary inline-block">
              Inquire for Pricing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl text-charcoal mb-6">
              Custom Packages Available
            </h2>
            <p className="text-medium-gray mb-8">
              Don&apos;t see exactly what you need? I&apos;m happy to create a custom package tailored to your
              specific requirements. Contact me to discuss your vision and we&apos;ll create something perfect
              together.
            </p>
            <a href="/contact" className="btn-primary">
              Let&apos;s Chat
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
