"use client";

import type { Product } from "@usestorekit/sdk";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatMoney } from "../lib/format";
import { stripHtml } from "../lib/html";
import { productHeat } from "../lib/product";
import { useProductPurchase } from "../lib/use-product-purchase";
import { QuickViewDialog } from "./QuickViewDialog";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const p = useProductPurchase(product);
  const [quickOpen, setQuickOpen] = useState(false);
  const heat = productHeat(product);
  const telugu = product.attributes?.telugu;
  const image = product.images[0];

  const addLabel = p.soldOut ? "Sold out" : p.error ? "Try again" : "Add";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_-20px_rgba(74,10,16,0.4)] ring-1 ring-maroon/10"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-soft">
        <Link
          href={`/products/${product.slug}`}
          data-haptic="light"
          className="absolute inset-0 block"
          aria-label={product.name}
        >
          {image ? (
            <Image
              src={image}
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
        </Link>

        {/* Badge stack */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {p.discountPct > 0 && (
            <span className="rounded-full bg-chilli px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream shadow">
              {p.discountPct}% off
            </span>
          )}
          {product.isBestseller && (
            <span className="rounded-full bg-turmeric px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal shadow">
              ★ Bestseller
            </span>
          )}
          {heat > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-maroon/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream backdrop-blur">
              <Flame /> {"🌶️".repeat(heat)}
            </span>
          )}
        </div>

        {/* Quick view — hover-reveal on desktop, always shown on touch */}
        <button
          type="button"
          onClick={() => setQuickOpen(true)}
          data-haptic="medium"
          className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-cream/95 px-4 py-2 text-xs font-bold uppercase tracking-wider text-maroon opacity-100 shadow-lg ring-1 ring-maroon/10 transition-all hover:bg-chilli hover:text-cream focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          Quick view
        </button>

        {p.soldOut && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-charcoal/35">
            <span className="rounded-full bg-charcoal/85 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cream">
              Sold out
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {telugu && (
          <span className="font-display text-xs italic text-chilli">
            {telugu}
          </span>
        )}
        <Link href={`/products/${product.slug}`} data-haptic="light">
          <h3 className="font-display text-lg font-bold leading-tight text-maroon hover:text-chilli">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-charcoal/70">
            {stripHtml(product.description)}
          </p>
        )}

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-maroon">
            {formatMoney(p.price, p.currency)}
          </span>
          {p.compareAt && p.compareAt > p.price && (
            <span className="text-xs text-charcoal/40 line-through">
              {formatMoney(p.compareAt, p.currency)}
            </span>
          )}
          {p.weight && (
            <span className="ml-auto text-[11px] uppercase tracking-wider text-charcoal/50">
              {p.weight}
            </span>
          )}
        </div>

        {/* Variant picker */}
        {p.variants.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.variants.map((v) => {
              const active = v.id === p.variantId;
              const vSoldOut = v.inventoryQty <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={vSoldOut}
                  onClick={() => p.setVariantId(v.id)}
                  data-haptic="selection"
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                    active
                      ? "border-chilli bg-chilli text-cream"
                      : "border-maroon/20 text-maroon hover:border-chilli"
                  }`}
                >
                  {v.attributes.weight ?? v.attributes.size ?? v.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Add button, or cart-bound stepper once in the cart.
            Outlined "Add" vs. solid stepper keeps the two states distinct. */}
        <div className="mt-4">
          {p.inCart > 0 ? (
            <div className="flex items-center justify-between rounded-full bg-chilli px-1.5 py-1 text-cream shadow-[0_4px_0_#5a0512]">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={p.dec}
                disabled={p.busy}
                data-haptic="selection"
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-colors hover:bg-chilli-deep disabled:opacity-50"
              >
                −
              </button>
              <span className="flex flex-col items-center leading-none">
                <span className="text-sm font-bold tabular-nums">
                  {p.inCart}
                </span>
                <span className="text-[9px] uppercase tracking-wider opacity-80">
                  in cart
                </span>
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={p.inc}
                disabled={p.busy || p.atMax}
                data-haptic="selection"
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-colors hover:bg-chilli-deep disabled:opacity-50"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={p.inc}
              disabled={p.soldOut || p.busy}
              data-haptic="medium"
              className="flex w-full items-center justify-center gap-1.5 rounded-full border-2 border-chilli bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-chilli transition-colors hover:bg-chilli hover:text-cream disabled:cursor-not-allowed disabled:border-charcoal/15 disabled:bg-transparent disabled:text-charcoal/40"
            >
              {!p.soldOut && !p.error && <CartPlus />}
              {addLabel}
            </button>
          )}
        </div>
      </div>

      <QuickViewDialog
        product={product}
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        initialVariantId={p.variantId}
      />
    </motion.article>
  );
}

function CartPlus() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <title>Add to cart</title>
      <path d="M3 4h2l2.5 11h9l2-7H6.5" />
      <circle cx="9" cy="19" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="19" r="1.4" fill="currentColor" stroke="none" />
      <path d="M19 3v4M21 5h-4" />
    </svg>
  );
}

function Flame() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <title>Heat</title>
      <path d="M13 2c1 4 4 5 4 9a5 5 0 11-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 2-8z" />
    </svg>
  );
}
