"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-off-white">
      {/* Hero Section */}
      <section className="section-padding bg-cream">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Photographer Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[3/4] rounded-lg overflow-hidden order-2 lg:order-1"
            >
              <Image
                src="/images/portrait-flowers.jpg"
                alt="Hailey Brooke - Photographer"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal mb-2">
                Hey, I&apos;m Hailey!
              </h1>
              <p className="font-accent text-dusty-rose text-xl mb-6">
                I&apos;m so glad you&apos;re here
              </p>
              <p className="text-medium-gray text-lg mb-6">
                I&apos;m a Kentucky-based photographer specializing in weddings, portraits, and all
                the beautiful moments in between.
              </p>
              <p className="text-medium-gray mb-6">
                Photography has been my passion since 2019 and my profession since 2023. In that time,
                I&apos;ve learned that the best images aren&apos;t about perfect poses; they&apos;re about real
                moments, genuine emotion, and the connections that make life meaningful.
              </p>
              <p className="text-medium-gray mb-6">
                My goal for every session is simple: make you feel comfortable, capture who you
                really are, and deliver images you&apos;ll treasure for a lifetime.
              </p>
              <p className="text-medium-gray mb-6">
                When I&apos;m not behind the camera, I&apos;m usually adventuring with my dog Delilah,
                exploring new places, or hunting down the best local restaurant I can find.
              </p>
              <p className="text-medium-gray">
                I can&apos;t wait to hear your story.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-6">
                My Approach
              </h2>
              <p className="text-medium-gray text-lg">
                I focus on creating a relaxed, enjoyable experience that allows your true personality
                to shine through. My style blends candid moments with soft, elegant direction.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Authentic",
                  description:
                    "Real emotions, genuine connections. I capture who you truly are, not posed perfection.",
                },
                {
                  title: "Timeless",
                  description:
                    "Clean, classic editing that won't look dated. Images you'll treasure for generations.",
                },
                {
                  title: "Personal",
                  description:
                    "Every session is tailored to you. Your story is unique, and your photos should be too.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <h3 className="font-display text-xl text-charcoal mb-3">{item.title}</h3>
                  <p className="text-medium-gray">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fun Facts Section */}
      <section className="section-padding bg-cream">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-4">
              A Little More About Me
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Years of Experience", value: "3+" },
              { label: "Happy Families", value: "100+" },
              { label: "Cups of Coffee", value: "Countless" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 text-center shadow-sm"
              >
                <p className="font-display text-3xl text-dusty-rose mb-2">{stat.value}</p>
                <p className="text-medium-gray text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Touch Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-6">
                When I&apos;m Not Behind the Camera
              </h2>
              <p className="text-medium-gray mb-4">
                You&apos;ll find me exploring local coffee shops, chasing after my dog Delilah,
                or curled up with a good book.
              </p>
              <p className="text-medium-gray mb-4">
                I&apos;m a firm believer that life is meant to be celebrated - from the big milestones
                to the quiet everyday moments. That philosophy carries through everything I do,
                both personally and professionally.
              </p>
              <p className="text-medium-gray">
                I&apos;d love to hear your story and help you preserve your own precious moments.
                Let&apos;s create something beautiful together.
              </p>
            </motion.div>

            {/* Personal Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-[4/5] rounded-lg overflow-hidden"
            >
              <Image
                src="/images/hailey-personal.jpg"
                alt="Hailey away from the camera"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-charcoal">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl text-cream mb-4">
              Let&apos;s Work Together
            </h2>
            <p className="text-beige mb-8 max-w-xl mx-auto">
              I&apos;d love to learn more about you and what you&apos;re looking to capture.
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
