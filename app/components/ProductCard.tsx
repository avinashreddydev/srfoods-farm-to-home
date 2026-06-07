"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { storefront } from "@/lib/storekit-client";
import { formatMoney } from "../lib/format";
import { stripHtml } from "../lib/html";
import type { StoreProduct } from "../lib/types";

export function ProductCard({
  product,
  index = 0,
}: {
  product: StoreProduct;
  index?: number;
}) {
  const { add } = storefront.useCart();
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");
  const soldOut = !product.isAvailable || !product.variantId;

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut || state === "adding") return;
    setState("adding");
    const { error } = await add({ variantId: product.variantId, quantity: 1 });
    if (error) {
      setState("idle");
      return;
    }
    setState("added");
    setTimeout(() => setState("idle"), 1500);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_-20px_rgba(74,10,16,0.4)] ring-1 ring-maroon/10"
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-cream-soft"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-chilli/15 to-maroon/15 text-5xl">
            🫙
          </div>
        )}
        {product.heat > 0 && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-maroon/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream backdrop-blur">
            <Flame /> {"🌶️".repeat(product.heat)}
          </div>
        )}
        {soldOut && (
          <div className="absolute right-3 top-3 rounded-full bg-charcoal/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream">
            Sold out
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {product.telugu && (
          <span className="font-display text-xs italic text-chilli">
            {product.telugu}
          </span>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-lg font-bold leading-tight text-maroon hover:text-chilli">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-charcoal/70">
            {stripHtml(product.description)}
          </p>
        )}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-maroon">
                {formatMoney(product.price, product.currency)}
              </span>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <span className="text-xs text-charcoal/40 line-through">
                    {formatMoney(product.compareAtPrice, product.currency)}
                  </span>
                )}
            </div>
            {product.weight && (
              <div className="text-[11px] uppercase tracking-wider text-charcoal/50">
                {product.weight}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || state === "adding"}
            className="rounded-full bg-chilli px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream shadow-[0_4px_0_#5a0512] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {soldOut
              ? "Sold out"
              : state === "adding"
                ? "Adding…"
                : state === "added"
                  ? "Added ✓"
                  : "Add"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function Flame() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2c1 4 4 5 4 9a5 5 0 11-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 2-8z" />
    </svg>
  );
}
