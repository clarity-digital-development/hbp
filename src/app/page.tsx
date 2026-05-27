"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const heroImageDesktop = "/images/hero-main.png";
const heroImageMobile = "/images/hero-mobile.jpg";


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

const testimonials = [
  {
    name: "Emma N.",
    event: "Portrait Session",
    image: "/images/testimonial-emma.jpg",
    text: "Hailey is so easy to work with! A true sweetheart that has an eye for the right shot! Technically skilled and a pleasure to meet. I would definitely book with Hailey again because she helped bring my confidence out and made me feel beautiful!",
  },
  {
    name: "Jasmine O.",
    event: "Portrait Session",
    image: "/images/testimonial-jasmine.jpg",
    text: "I love working with Hailey, she makes it so much fun and easy to be in front of the camera. She is so sweet and my photos came out amazing.",
  },
];

const galleryCategories = [
  { name: "Couples", image: "/images/service-couples.jpg", href: "/portfolio?category=Couples%20%26%20Engagement" },
  { name: "Branding", image: "/images/service-branding.jpg", href: "/portfolio?category=Branding" },
  { name: "Portraits", image: "/images/service-portraits.jpg", href: "/portfolio?category=Portraits" },
  { name: "Weddings", image: "/images/service-weddings.jpg", href: "/contact?service=Wedding" },
];

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTestimonial]);

  const goToTestimonial = (index: number) =>
    setActiveTestimonial((index + testimonials.length) % testimonials.length);

  return (
    <main className="overflow-hidden">
      {/* Hero Section — full viewport image with overlay text */}
      <section className="relative h-screen w-full -mt-20 lg:-mt-24 overflow-hidden">
        <div className="absolute inset-0 lg:hidden">
          <Image
            src={heroImageMobile}
            alt="Hailey Brooke Photography"
            fill
            className="object-cover object-[center_30%]"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 hidden lg:block">
          <Image
            src={heroImageDesktop}
            alt="Hailey Brooke Photography"
            fill
            className="object-cover object-[center_30%]"
            priority
            sizes="100vw"
          />
        </div>

        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/55 via-charcoal/25 to-transparent lg:from-charcoal/55 lg:via-charcoal/15 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent lg:hidden" />

        {/* Content overlay — bottom-left on desktop, centered on mobile */}
        <div className="relative h-full flex items-center lg:items-end px-4 sm:px-6 lg:pl-10 xl:pl-16 pt-20 lg:pt-0 lg:pb-24">
          <motion.div
            className="w-full text-center lg:text-left lg:max-w-xl"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1
              className="font-display text-5xl sm:text-6xl lg:text-7xl text-white mb-6 font-medium drop-shadow-lg"
              variants={fadeInUp}
            >
              <span className="block">Your story,</span>
              <span className="block mt-2">beautifully told.</span>
            </motion.h1>
            <motion.p
              className="font-body text-lg md:text-xl text-white mb-10 tracking-wide drop-shadow"
              variants={fadeInUp}
            >
              Kentucky Portrait &amp; Lifestyle Photographer
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={fadeInUp}
            >
              <Link href="/portfolio" className="btn-sage-dark">
                View Portfolio
              </Link>
              <Link href="/contact" className="btn-sage">
                Book a Session
              </Link>
            </motion.div>
          </motion.div>
        </div>

      </section>

      {/* About Section */}
      <section className="section-padding bg-off-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-stretch">
            {/* Left Image */}
            <motion.div
              className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl hidden lg:block"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src="/images/intro-left.jpg"
                alt="Client photography"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Center Text */}
            <motion.div
              className="text-center flex flex-col justify-center py-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-display text-3xl md:text-4xl text-charcoal italic mb-6">
                Life is art, let me show you its beauty.
              </h2>
              <div className="w-16 h-px bg-dusty-rose mx-auto mb-6" />
              <p className="text-medium-gray leading-relaxed mb-4">
                Photography has been my passion since 2019 and my profession since 2023.
                I&apos;ve learned that the best images aren&apos;t about perfect poses; they&apos;re
                about real moments, genuine emotion, and the connections that make life meaningful.
              </p>
              <p className="text-medium-gray leading-relaxed mb-8">
                My goal for every session is simple: make you feel comfortable, capture who you
                really are, and deliver images you&apos;ll treasure for a lifetime.
              </p>
              <div>
                <Link href="/about" className="btn-primary">
                  About Me
                </Link>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl hidden lg:block"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src="/images/intro-right.jpg"
                alt="Client photography"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section — side-by-side 9:16 cards with labels below */}
      <section className="section-padding bg-cream">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-4">
              Gallery
            </h2>
            <p className="font-accent text-dusty-rose text-xl">
              Capturing life&apos;s beautiful moments
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 max-w-md mx-auto lg:max-w-none">
            {galleryCategories.map((category, idx) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
              >
                <Link href={category.href} className="group block">
                  <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-beige">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 25vw"
                    />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl text-charcoal text-center mt-4 group-hover:text-mauve transition-colors">
                    {category.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/investment" className="btn-secondary">
              View Pricing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Kind Words — auto-scrolling testimonial carousel */}
      <section className="section-padding bg-off-white">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-4">
              Kind Words
            </h2>
            <p className="font-accent text-dusty-rose text-xl">
              From clients who became friends
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
            {/* Photo — changes with the active testimonial (fixed aspect ratio for consistency) */}
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quote — changes with the active testimonial */}
            <div className="relative flex flex-col justify-center bg-cream rounded-lg shadow-md p-8 md:p-10 min-h-[24rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Sparkles key={i} className="w-5 h-5 text-blush fill-blush" />
                    ))}
                  </div>
                  <p className="font-display text-xl md:text-2xl text-charcoal italic leading-relaxed mb-6">
                    &quot;{testimonials[activeTestimonial].text}&quot;
                  </p>
                  <p className="font-display text-xl text-charcoal">
                    {testimonials[activeTestimonial].name}
                  </p>
                  <p className="font-accent text-dusty-rose text-sm">
                    {testimonials[activeTestimonial].event}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="flex items-center justify-between mt-8">
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToTestimonial(i)}
                      aria-label={`Show testimonial ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === activeTestimonial ? "w-6 bg-dusty-rose" : "w-2 bg-beige"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToTestimonial(activeTestimonial - 1)}
                    aria-label="Previous testimonial"
                    className="h-10 w-10 rounded-full border border-charcoal/20 flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-white transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => goToTestimonial(activeTestimonial + 1)}
                    aria-label="Next testimonial"
                    className="h-10 w-10 rounded-full border border-charcoal/20 flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-white transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="section-padding bg-taupe">
        <div className="container-custom">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream mb-6">
              Ready to book your session?
            </h2>
            <p className="font-accent text-cream/80 text-xl mb-10 max-w-2xl mx-auto">
              Let&apos;s create something beautiful together. I&apos;d love to hear your story
              and help you preserve your most treasured moments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary">
                Get in Touch
              </Link>
              <Link href="/investment" className="btn-secondary">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
