"use client";

// Shared variant + cart-bound quantity state for ProductCard and
// QuickViewDialog. The stepper tracks how many of the selected variant are in
// the cart, so the UI shows "Add" until the first unit, then a quantity control.

import { useMemo, useState } from "react";
import { storefront } from "@/lib/storekit-client";
import type { StoreProduct, StoreVariant } from "./types";

export type ProductPurchase = {
  variants: StoreVariant[];
  selected: StoreVariant | undefined;
  variantId: string;
  setVariantId: (id: string) => void;
  price: number;
  compareAt: number | null;
  weight: string | null;
  /** Whole-number percent off vs. compare-at price. */
  discountPct: number;
  /** Remaining stock for the selected variant. */
  inventory: number;
  soldOut: boolean;
  /** Selected variant's quantity in the cart (0 if none). */
  inCart: number;
  /** In-cart quantity has reached available stock. */
  atMax: boolean;
  /** A cart mutation is in flight. */
  busy: boolean;
  /** A cart mutation just failed (briefly true). */
  error: boolean;
  /** Add one (also backs the + control). */
  inc: () => Promise<void>;
  /** Remove one (drops the line at 0). */
  dec: () => Promise<void>;
};

export function useProductPurchase(
  product: StoreProduct,
  initialVariantId?: string,
): ProductPurchase {
  const { cart, add, setQuantity, remove } = storefront.useCart();
  const [variantId, setVariantId] = useState(
    initialVariantId ?? product.variantId,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const selected = useMemo(
    () =>
      product.variants.find((v) => v.id === variantId) ?? product.variants[0],
    [product.variants, variantId],
  );

  const price = selected?.price ?? product.price;
  const compareAt = selected?.compareAtPrice ?? null;
  const weight = selected?.weight ?? product.weight;
  const inventory = selected?.inventoryQty ?? 0;
  const discountPct =
    compareAt && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : 0;
  const soldOut = !product.isAvailable || !selected || inventory <= 0;

  const line = cart?.items.find((i) => i.variantId === variantId);
  const inCart = line?.quantity ?? 0;
  const atMax = inventory > 0 && inCart >= inventory;

  async function setCartQty(quantity: number) {
    if (busy) return;
    setBusy(true);
    setError(false);
    let failed: unknown;
    if (!line) {
      if (quantity > 0)
        ({ error: failed } = await add({ variantId, quantity }));
    } else if (quantity <= 0) {
      ({ error: failed } = await remove(line.id));
    } else {
      ({ error: failed } = await setQuantity(line.id, quantity));
    }
    setBusy(false);
    if (failed) {
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
  }

  async function inc() {
    if (soldOut || atMax) return;
    await setCartQty(inCart + 1);
  }

  async function dec() {
    if (inCart <= 0) return;
    await setCartQty(inCart - 1);
  }

  return {
    variants: product.variants,
    selected,
    variantId,
    setVariantId,
    price,
    compareAt,
    weight,
    discountPct,
    inventory,
    soldOut,
    inCart,
    atMax,
    busy,
    error,
    inc,
    dec,
  };
}
