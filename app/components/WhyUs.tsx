"use client";

import { motion } from "motion/react";
import { SectionHeading } from "./Section";

const features = [
  {
    icon: "🌶️",
    title: "Authentic Recipes",
    desc: "Traditional Andhra recipes passed down through generations.",
  },
  {
    icon: "🌾",
    title: "Farm-Fresh Ingredients",
    desc: "Sourced directly from our trusted Guntur farmers.",
  },
  {
    icon: "🫙",
    title: "Handmade Taste",
    desc: "Stone-ground, hand-pounded, slow-cured in small batches.",
  },
  {
    icon: "✨",
    title: "Hygienic Preparation",
    desc: "Modern food-safe kitchens, traditional cooking methods.",
  },
  {
    icon: "🔥",
    title: "Rich Regional Flavour",
    desc: "Bold, fiery, unmistakably Andhra — no compromises.",
  },
  {
    icon: "🚚",
    title: "Doorstep Delivery",
    desc: "Sealed for freshness, shipped pan-India in 3–5 days.",
  },
];

export function WhyUs() {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <SectionHeading
          eyebrow="Why SR Foods"
          title={
            <>
              Crafted with <span className="text-chilli">Care</span>, Loved for
              Flavour
            </>
          }
          subtitle="Every jar carries the soul of Andhra cooking — and our promise of quality."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-maroon/10 shadow-[0_10px_40px_-25px_rgba(74,10,16,0.4)]"
            >
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-chilli/5 transition-all group-hover:scale-150 group-hover:bg-chilli/10" />
              <div className="relative">
                <div className="text-4xl">{f.icon}</div>
                <h3 className="mt-4 font-display text-xl font-bold text-maroon">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-charcoal/70 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
