"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import type { Product } from "@usestorekit/sdk";
import { storefront } from "@/lib/storekit-client";
import { formatMoney } from "../lib/format";

export function AddToCartPanel({ product }: { product: Product }) {
  const { add } = storefront.useCart();
  const { data: store } = storefront.useStore();
  const currency = store?.currency ?? "INR";
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [state, setState] = useState<"idle" | "adding" | "added" | "error">(
    "idle",
  );

  const selected =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const price = Number(selected?.price) || 0;
  const compareAt = selected?.compareAtPrice
    ? Number(selected.compareAtPrice)
    : null;
  const soldOut =
    !product.isAvailable || !selected || selected.inventoryQty <= 0;

  async function handleAdd() {
    if (soldOut || state === "adding") return;
    setState("adding");
    const { error } = await add({ variantId, quantity: qty });
    setState(error ? "error" : "added");
    if (!error) setTimeout(() => setState("idle"), 2500);
  }

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-bold text-maroon">
          {formatMoney(price, currency)}
        </span>
        {compareAt && compareAt > price && (
          <span className="text-lg text-charcoal/40 line-through">
            {formatMoney(compareAt, currency)}
          </span>
        )}
      </div>

      {product.variants.length > 1 && (
        <div className="mt-6">
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
            Size
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const active = v.id === variantId;
              const vSoldOut = v.inventoryQty <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={vSoldOut}
                  onClick={() => setVariantId(v.id)}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
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
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <div className="inline-flex items-center rounded-full border-2 border-maroon/20">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2 text-lg font-bold text-maroon disabled:opacity-40"
            disabled={qty <= 1}
          >
            −
          </button>
          <span className="w-8 text-center font-semibold text-maroon">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="px-4 py-2 text-lg font-bold text-maroon"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut || state === "adding"}
          className="btn-primary flex-1 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-50"
        >
          {soldOut
            ? "Sold out"
            : state === "adding"
              ? "Adding…"
              : state === "added"
                ? "Added to cart ✓"
                : "Add to cart"}
        </button>
      </div>

      {state === "added" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-between rounded-2xl bg-cream-soft px-5 py-3 ring-1 ring-maroon/10"
        >
          <span className="text-sm text-charcoal/70">
            Added to your basket.
          </span>
          <Link
            href="/cart"
            className="text-sm font-bold uppercase tracking-wider text-chilli hover:underline"
          >
            View cart →
          </Link>
        </motion.div>
      )}
      {state === "error" && (
        <p className="mt-4 text-sm text-chilli">
          Couldn&apos;t add this item. Please try again.
        </p>
      )}
    </div>
  );
}
