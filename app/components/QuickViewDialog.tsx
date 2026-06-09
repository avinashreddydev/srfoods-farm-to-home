"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatMoney } from "../lib/format";
import type { StoreProduct } from "../lib/types";
import { useProductPurchase } from "../lib/use-product-purchase";

export function QuickViewDialog({
  product,
  open,
  onClose,
  initialVariantId,
}: {
  product: StoreProduct;
  open: boolean;
  onClose: () => void;
  initialVariantId?: string;
}) {
  // Portal needs a DOM target — render only after mount (SSR-safe).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <QuickViewContent
          product={product}
          onClose={onClose}
          initialVariantId={initialVariantId}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}

function QuickViewContent({
  product,
  onClose,
  initialVariantId,
}: {
  product: StoreProduct;
  onClose: () => void;
  initialVariantId?: string;
}) {
  const p = useProductPurchase(product, initialVariantId);
  const panelRef = useRef<HTMLDivElement>(null);
  const images =
    product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];
  const [activeImg, setActiveImg] = useState(0);
  const heroImg = images[activeImg];

  // Escape to close, lock scroll, restore focus on unmount.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  // Keep Tab focus inside the dialog.
  function trapFocus(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])',
    );
    if (!nodes || nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const addLabel = p.soldOut
    ? "Sold out"
    : p.error
      ? "Try again"
      : "Add to cart";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-charcoal/60 p-0 backdrop-blur-sm md:items-center md:p-6"
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view: ${product.name}`}
        tabIndex={-1}
        onKeyDown={trapFocus}
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="relative grid w-full max-w-4xl gap-0 overflow-hidden rounded-t-3xl bg-cream shadow-2xl outline-none ring-1 ring-maroon/10 md:max-h-[90vh] md:grid-cols-2 md:rounded-3xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-maroon shadow ring-1 ring-maroon/10 transition-colors hover:bg-chilli hover:text-cream"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <title>Close</title>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* Gallery */}
        <div className="bg-cream-soft p-5 md:p-6">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream ring-1 ring-maroon/10">
            {heroImg ? (
              <Image
                src={heroImg}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-chilli/15 to-maroon/15 text-6xl">
                🫙
              </div>
            )}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
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
              {product.heat > 0 && (
                <span className="rounded-full bg-maroon/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream backdrop-blur">
                  {"🌶️".repeat(product.heat)}
                </span>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.slice(0, 4).map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`relative aspect-square w-16 overflow-hidden rounded-lg ring-1 transition-all ${
                    i === activeImg
                      ? "ring-2 ring-chilli"
                      : "ring-maroon/10 hover:ring-chilli/50"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex max-h-[70vh] flex-col overflow-y-auto p-6 md:max-h-[90vh] md:p-8">
          {product.telugu && (
            <span className="font-display text-base italic text-chilli">
              {product.telugu}
            </span>
          )}
          <h2 className="font-display text-2xl font-black leading-tight text-maroon md:text-3xl">
            {product.name}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {product.heat > 0 && (
              <span className="rounded-full bg-maroon/5 px-2.5 py-1 font-semibold text-maroon">
                Heat {"🌶️".repeat(product.heat)}
              </span>
            )}
            {product.categoryName && (
              <Link
                href={`/category/${product.category}`}
                className="rounded-full bg-maroon/5 px-2.5 py-1 font-semibold capitalize text-maroon hover:text-chilli"
              >
                {product.categoryName}
              </Link>
            )}
            {p.soldOut ? (
              <span className="font-semibold text-charcoal/50">● Sold out</span>
            ) : p.inventory <= 5 ? (
              <span className="font-semibold text-ember">
                ● Only {p.inventory} left
              </span>
            ) : (
              <span className="font-semibold text-emerald-700">● In stock</span>
            )}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-maroon">
              {formatMoney(p.price, product.currency)}
            </span>
            {p.compareAt && p.compareAt > p.price && (
              <span className="text-lg text-charcoal/40 line-through">
                {formatMoney(p.compareAt, product.currency)}
              </span>
            )}
          </div>

          {product.description && (
            <div
              className="mt-4 text-sm leading-relaxed text-charcoal/75 [&_a]:text-chilli [&_a]:underline [&_h2]:mt-3 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-maroon [&_h3]:mt-3 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-maroon [&_li]:mb-1 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_strong]:font-semibold [&_strong]:text-maroon [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          {p.variants.length > 1 && (
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
                Size
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.variants.map((v) => {
                  const active = v.id === p.variantId;
                  const vSoldOut = v.inventoryQty <= 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={vSoldOut}
                      onClick={() => p.setVariantId(v.id)}
                      className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                        active
                          ? "border-chilli bg-chilli text-cream"
                          : "border-maroon/20 text-maroon hover:border-chilli"
                      }`}
                    >
                      {v.weight ?? v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-auto pt-6">
            {p.inCart > 0 ? (
              <div className="flex items-center justify-between rounded-full bg-chilli px-2 py-1.5 text-cream shadow-[0_6px_0_#5a0512]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={p.dec}
                  disabled={p.busy}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-2xl font-bold transition-colors hover:bg-chilli-deep disabled:opacity-50"
                >
                  −
                </button>
                <span className="flex flex-col items-center leading-none">
                  <span className="text-lg font-bold tabular-nums">
                    {p.inCart}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">
                    in cart
                  </span>
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={p.inc}
                  disabled={p.busy || p.atMax}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-2xl font-bold transition-colors hover:bg-chilli-deep disabled:opacity-50"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={p.inc}
                disabled={p.soldOut || p.busy}
                className="btn-primary w-full rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addLabel}
              </button>
            )}

            <div className="mt-4 flex items-center justify-between">
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="text-sm font-bold uppercase tracking-wider text-chilli hover:underline"
              >
                View full details →
              </Link>
              {p.inCart > 0 && (
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="text-sm font-bold uppercase tracking-wider text-maroon hover:underline"
                >
                  Go to cart →
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
