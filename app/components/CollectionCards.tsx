"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@usestorekit/sdk";
import { motion } from "motion/react";

// Accent gradients and image fallbacks aren't part of the category data in
// Storekit, so we keep a small brand palette here and index into it per card.
const ACCENTS = ["from-chilli to-maroon", "from-ember to-chilli-deep"];
const FALLBACK_IMAGES = ["/mango-pickle.png", "/plain-mirchi-karam.png"];

export function CollectionCards({ collections }: { collections: Category[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      {collections.map((c, i) => {
        const image = c.imageUrl ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
        const accent = ACCENTS[i % ACCENTS.length];
        const telugu = c.attributes?.telugu ?? c.attributes?.te;
        const desc =
          c.description ??
          `Explore our handcrafted ${c.name.toLowerCase()} collection.`;
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <Link
              href={`/category/${c.slug}`}
              className="group relative block overflow-hidden rounded-[2rem] bg-charcoal text-cream"
            >
              <div className="relative aspect-[4/5] md:aspect-[5/4]">
                <Image
                  src={image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-tr ${accent} opacity-60 mix-blend-multiply`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />
              </div>

              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                {telugu && (
                  <span className="font-display text-sm italic text-turmeric">
                    {telugu}
                  </span>
                )}
                <h3 className="font-display text-4xl font-black md:text-6xl">
                  {c.name}
                </h3>
                <p className="mt-3 max-w-md text-sm text-cream/80 md:text-base">
                  {desc}
                </p>
                <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-turmeric px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-maroon transition-transform group-hover:translate-x-1">
                  Explore {c.name} <span>→</span>
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
