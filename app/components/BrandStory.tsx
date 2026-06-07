"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function BrandStory() {
  return (
    <section className="relative overflow-hidden bg-maroon text-cream py-20 md:py-28">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(232,178,42,0.5), transparent 40%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] ring-4 ring-turmeric/30 shadow-2xl">
            <Image
              src="/gongura-pandu-mirchi-pickle.png"
              alt="Gongura pickle"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: "spring" }}
            className="absolute -bottom-6 -right-6 rounded-2xl bg-turmeric p-5 text-maroon shadow-2xl"
          >
            <div className="font-display text-3xl font-black leading-none">
              25+
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest">
              Years of recipes
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-turmeric" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-turmeric">
              Our Story
            </span>
          </div>
          <h2 className="font-display mt-4 text-4xl font-black leading-tight md:text-5xl">
            Andhra heritage,
            <br />
            in every <span className="text-turmeric">spoonful</span>.
          </h2>
          <p className="mt-6 text-cream/80 leading-relaxed">
            SR Foods – Farm to Home was born in the chilli fields of Guntur,
            where generations of our family have hand-picked, sun-dried and
            stone-ground spices the way our grandmothers taught us.
          </p>
          <p className="mt-4 text-cream/80 leading-relaxed">
            Every jar of pickle is cured for weeks. Every karam is roasted in
            small batches. No shortcuts, no preservatives — just bold, honest
            Andhra flavour, packed with love and shipped to your home.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { n: "100%", l: "Homemade" },
              { n: "0", l: "Preservatives" },
              { n: "10k+", l: "Happy homes" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-cream/15 bg-chilli-deep/30 p-4 text-center"
              >
                <div className="font-display text-2xl font-black text-turmeric">
                  {s.n}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-cream/60">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
