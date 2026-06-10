"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-maroon text-cream">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(232,178,42,0.6), transparent 40%), radial-gradient(circle at 80% 60%, rgba(200,16,46,0.6), transparent 50%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28 md:px-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-turmeric/40 bg-chilli-deep/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-turmeric"
          >
            <span>🌶️</span> Guntur Mirchi · Spicy &amp; Authentic
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display mt-6 text-5xl font-black leading-[1.05] tracking-tight md:text-7xl"
          >
            Spicy &amp; Authentic
            <br />
            <span className="text-turmeric text-shadow-flame">Flavours</span>
            <br />
            from{" "}
            <span className="bg-linear-to-r from-chilli to-ember bg-clip-text text-transparent">
              Farm to Home
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 max-w-xl text-base text-cream/80 md:text-lg"
          >
            Hand-pounded karam powders and slow-cured Andhra pickles, made with
            sun-dried Guntur chillies, cold-pressed sesame oil and recipes
            passed down for generations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              href="/category/pickles"
              data-haptic="medium"
              className="btn-primary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider"
            >
              Shop Pickles <span>→</span>
            </Link>
            <Link
              href="/category/karam"
              data-haptic="light"
              className="btn-outline inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider"
            >
              Shop Karam
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-widest text-cream/60"
          >
            <span>✓ 100% Homemade</span>
            <span>✓ No Preservatives</span>
            <span>✓ Cold-pressed Oils</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative mx-auto aspect-square w-full max-w-lg"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-turmeric/30"
          />
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-full w-full overflow-hidden rounded-full ring-8 ring-chilli/30 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
          >
            <Image
              src="/pandu-mirchi-pickle.jpg"
              alt="Pandu mirchi pickle"
              fill
              priority
              sizes="(max-width: 768px) 80vw, 480px"
              className="object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -left-2 top-8 rounded-2xl bg-cream/95 p-3 text-charcoal shadow-xl ring-1 ring-maroon/10 md:-left-8"
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-chilli">
              Heat Level
            </div>
            <div className="text-lg">🌶️🌶️🌶️🌶️🌶️</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="absolute -right-2 bottom-10 rounded-2xl bg-turmeric p-3 text-maroon shadow-xl md:-right-6"
          >
            <div className="text-[10px] font-bold uppercase tracking-widest">
              Made in
            </div>
            <div className="font-display text-base font-bold">Guntur, AP</div>
          </motion.div>
        </motion.div>
      </div>

      <Marquee />
    </section>
  );
}

function Marquee() {
  const items = [
    "Avakaya",
    "Gongura Pachadi",
    "Pandu Mirchi",
    "Vellulli Karam",
    "Sambhar Masala",
    "Idli Karam",
    "Kandi Podi",
  ];
  return (
    <div className="relative border-y border-cream/10 bg-charcoal py-3 overflow-hidden">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 whitespace-nowrap"
      >
        {[...items, ...items].map((it, i) => (
          <span
            key={i}
            className="font-display text-2xl font-bold text-turmeric/80"
          >
            {it} <span className="text-chilli">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
