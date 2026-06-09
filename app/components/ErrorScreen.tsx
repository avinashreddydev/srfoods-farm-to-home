"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Shared full-bleed status screen used by both the 404 (`not-found.tsx`) and
 * 500 (`error.tsx` / `global-error.tsx`) pages so the error experience matches
 * the brand's hero/banner language — maroon backdrop, spice glow, a flame-lit
 * display number and a Telugu accent line.
 */
export function ErrorScreen({
  code,
  eyebrow,
  telugu,
  title,
  subtitle,
  footnote,
  children,
}: {
  code: ReactNode;
  eyebrow: string;
  telugu?: string;
  title: ReactNode;
  subtitle: string;
  footnote?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[78vh] items-center overflow-hidden bg-maroon text-cream">
      {/* warm spice glow */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(232,178,42,0.6), transparent 42%), radial-gradient(circle at 78% 70%, rgba(200,16,46,0.65), transparent 52%)",
        }}
      />
      <div className="absolute inset-0 bg-spice-grain opacity-30" />

      <div className="relative mx-auto w-full max-w-3xl px-6 py-20 text-center md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-turmeric/40 bg-chilli-deep/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-turmeric"
        >
          <span>🌶️</span> {eyebrow}
        </motion.div>

        {/* giant status code with a slowly rotating dashed ring */}
        <div className="relative mx-auto mt-8 flex h-44 items-center justify-center md:h-56">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 aspect-square h-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-turmeric/25 md:h-56"
          />
          <motion.h1
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="font-display relative text-8xl font-black leading-none tracking-tight text-turmeric text-shadow-flame md:text-9xl"
          >
            {code}
          </motion.h1>
        </div>

        {telugu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display mt-5 text-xl italic text-turmeric"
          >
            {telugu}
          </motion.div>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-display mt-3 text-3xl font-black md:text-5xl"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mx-auto mt-5 max-w-xl text-cream/80 md:text-lg"
        >
          {subtitle}
        </motion.p>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            {children}
          </motion.div>
        )}

        {footnote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-xs uppercase tracking-widest text-cream/40"
          >
            {footnote}
          </motion.div>
        )}
      </div>
    </section>
  );
}
