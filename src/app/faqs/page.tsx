"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    category: "Booking & Sessions",
    questions: [
      {
        q: "What happens if it rains on our session day?",
        a: "Generally sessions are rebooked day of.",
      },
      {
        q: "How long is a typical session?",
        a: "Mini sessions are 30 minutes, standard sessions are 1-2 hours, and extended sessions can be 3+ hours. Wedding coverage varies by package but typically ranges from 4-10 hours.",
      },
      {
        q: "Can I bring my pet to the session?",
        a: "Absolutely! Pets are family too. I love including four-legged friends in sessions. Just let me know ahead of time so we can plan accordingly.",
      },
    ],
  },
  {
    category: "Pricing & Payment",
    questions: [
      {
        q: "Do you require a deposit?",
        a: "Yes, a 30% non-refundable retainer is required to secure your date. If you no-show without notifying me as to why, the card on file will be charged the remainder of the cost of the shoot.",
      },
      {
        q: "Do you offer payment plans?",
        a: "Yes! For wedding packages and larger sessions, I offer flexible payment plans. We can discuss options during our consultation.",
      },
    ],
  },
  {
    category: "Photos & Delivery",
    questions: [
      {
        q: "How long until I receive my photos?",
        a: "Photos are typically delivered within 1-3 weeks.",
      },
      {
        q: "How will I receive my images?",
        a: "All images are delivered through a beautiful online gallery where you can view, download, share, and order prints directly.",
      },
      {
        q: "Do I get the RAW files?",
        a: "I don't provide RAW files as they are unfinished images. All delivered photos are professionally edited to maintain the quality and style you hired me for.",
      },
      {
        q: "Can I print my photos anywhere?",
        a: "Yes! All packages include a print release, so you can print your photos wherever you'd like. However, I do recommend professional print labs for the best quality.",
      },
    ],
  },
  {
    category: "Before Your Session",
    questions: [
      {
        q: "What should we wear?",
        a: "I recommend coordinating (not matching) outfits in neutral or complementary colors. Avoid large logos and busy patterns.",
      },
      {
        q: "Where will we take photos?",
        a: "I have many favorite locations I can recommend based on your style and vision. You're also welcome to suggest a meaningful location. We'll finalize this during our planning call.",
      },
      {
        q: "What if my kids won't cooperate?",
        a: "Kids will be kids, and that's perfectly okay! Some of the best photos come from unscripted moments. I'm experienced with little ones and have lots of tricks to capture genuine smiles.",
      },
    ],
  },
];

function AccordionItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-beige">
      <button
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left hover:text-dusty-rose transition-colors"
      >
        <span className="text-charcoal font-medium pr-4">{question}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-5 h-5 text-dusty-rose flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-medium-gray">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQsPage() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-medium-gray text-lg max-w-2xl mx-auto"
          >
            Everything you need to know about working with me. Can&apos;t find what you&apos;re looking for?
            Feel free to reach out!
          </motion.p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          {faqs.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              className="mb-12"
            >
              <h2 className="font-display text-2xl text-charcoal mb-6">{section.category}</h2>
              <div className="bg-white rounded-lg shadow-sm p-6">
                {section.questions.map((item, index) => (
                  <AccordionItem
                    key={`${section.category}-${index}`}
                    question={item.q}
                    answer={item.a}
                    isOpen={openItems[`${section.category}-${index}`] || false}
                    onClick={() => toggleItem(`${section.category}-${index}`)}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="section-padding bg-cream">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-4">
              Still Have Questions?
            </h2>
            <p className="text-medium-gray mb-8 max-w-xl mx-auto">
              I&apos;m here to help! Don&apos;t hesitate to reach out with any questions you might have.
            </p>
            <a href="/contact" className="btn-primary">
              Contact Me
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
