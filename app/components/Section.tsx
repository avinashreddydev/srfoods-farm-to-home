"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"
      }
    >
      {eyebrow && (
        <div
          className={`flex items-center gap-3 ${
            align === "center" ? "justify-center" : ""
          }`}
        >
          <span className="h-px w-8 bg-chilli" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-chilli">
            {eyebrow}
          </span>
          <span className="h-px w-8 bg-chilli" />
        </div>
      )}
      <h2 className="mt-3 font-display text-3xl font-bold text-maroon md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-charcoal/70 md:text-lg">{subtitle}</p>
      )}
    </motion.div>
  );
}
