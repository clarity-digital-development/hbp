"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const stockImages = [
  "/images/couple.jpg",
  "/images/portrait-flowers.jpg",
  "/images/portrait-casual.jpg",
];

const categories = ["All", "Weddings", "Couples & Engagement", "Portraits", "Families"];

const portfolioItems = [
  { id: 1, category: "Weddings", title: "Sarah & James" },
  { id: 2, category: "Portraits", title: "Emma's Senior Session" },
  { id: 3, category: "Families", title: "The Johnson Family" },
  { id: 4, category: "Couples & Engagement", title: "Sunset Romance" },
  { id: 5, category: "Couples & Engagement", title: "Downtown Love Story" },
  { id: 6, category: "Weddings", title: "Maria & David" },
  { id: 7, category: "Portraits", title: "Creative Headshots" },
  { id: 8, category: "Families", title: "Fall Family Photos" },
  { id: 9, category: "Weddings", title: "Garden Ceremony" },
  { id: 10, category: "Couples & Engagement", title: "Lakeside Engagement" },
  { id: 11, category: "Families", title: "Holiday Mini Session" },
  { id: 12, category: "Portraits", title: "Natural Light Studio" },
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
                    src={stockImages[item.id % stockImages.length]}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/60 transition-all duration-300 flex items-end">
                    <div className="p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-dusty-rose text-sm uppercase tracking-wider mb-1">
                        {item.category}
                      </p>
                      <h3 className="font-display text-xl text-white">{item.title}</h3>
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
