"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const categories = ["All", "Weddings", "Couples & Engagement", "Portraits", "Branding"];

const portfolioItems = [
  { id: 1, category: "Branding", image: "/images/branding-1.jpg" },
  { id: 2, category: "Couples & Engagement", image: "/images/couple-1.jpg" },
  { id: 3, category: "Portraits", image: "/images/portrait-1.jpg" },
  { id: 4, category: "Weddings", image: "/images/service-weddings.jpg" },
  { id: 5, category: "Branding", image: "/images/branding-2.jpg" },
  { id: 6, category: "Portraits", image: "/images/portrait-2.jpg" },
  { id: 7, category: "Couples & Engagement", image: "/images/couple-2.jpg" },
  { id: 8, category: "Branding", image: "/images/branding-3.jpg" },
  { id: 9, category: "Portraits", image: "/images/portrait-3.jpg" },
  { id: 10, category: "Couples & Engagement", image: "/images/couple-3.jpg" },
  { id: 11, category: "Portraits", image: "/images/portrait-4.jpg" },
  { id: 12, category: "Branding", image: "/images/branding-4.jpg" },
  { id: 13, category: "Couples & Engagement", image: "/images/couple-4.jpg" },
  { id: 14, category: "Portraits", image: "/images/portrait-5.jpg" },
  { id: 15, category: "Weddings", image: "/images/wedding-1.jpg" },
  { id: 16, category: "Branding", image: "/images/branding-5.jpg" },
  { id: 17, category: "Couples & Engagement", image: "/images/couple-5.jpg" },
  { id: 18, category: "Portraits", image: "/images/portrait-6.jpg" },
  { id: 19, category: "Couples & Engagement", image: "/images/couple-6.jpg" },
  { id: 20, category: "Portraits", image: "/images/portrait-7.jpg" },
  { id: 21, category: "Couples & Engagement", image: "/images/couple-7.jpg" },
  { id: 22, category: "Portraits", image: "/images/portrait-8.jpg" },
  { id: 23, category: "Portraits", image: "/images/portrait-9.jpg" },
  { id: 24, category: "Portraits", image: "/images/portrait-10.jpg" },
  { id: 25, category: "Portraits", image: "/images/portrait-11.jpg" },
  { id: 26, category: "Portraits", image: "/images/portrait-12.jpg" },
];

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category && categories.includes(category)) {
      setActiveFilter(category);
    }
  }, []);

  const filteredItems =
    activeFilter === "All"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeFilter);

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
            Portfolio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-medium-gray text-lg max-w-2xl mx-auto"
          >
            A collection of cherished moments and beautiful stories captured through my lens.
          </motion.p>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-8 bg-off-white border-b border-beige">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  activeFilter === category
                    ? "bg-dusty-rose text-white"
                    : "bg-cream text-charcoal hover:bg-beige"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="group relative aspect-[4/5] bg-beige rounded-lg overflow-hidden cursor-pointer"
                >
                  {/* Portfolio Image */}
                  <Image
                    src={item.image}
                    alt={item.category}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/50 transition-all duration-300 flex items-end">
                    <div className="p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-display text-xl text-white">{item.category}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-cream">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-4">
              Ready to Create Your Story?
            </h2>
            <p className="text-medium-gray mb-8 max-w-xl mx-auto">
              Let&apos;s work together to capture your most precious moments.
            </p>
            <a href="/contact" className="btn-primary">
              Get in Touch
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
