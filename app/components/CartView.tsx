"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { storefront } from "@/lib/storekit-client";
import { formatMoney } from "../lib/format";

export function CartView() {
  const { cart, count, loading, error, setQuantity, remove, clear } =
    storefront.useCart();
  const [busyLine, setBusyLine] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  if (loading && !cart) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-center text-charcoal/60">
        Loading your basket…
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-center">
        <p className="text-chilli">We couldn&apos;t load your cart.</p>
        <button
          type="button"
          onClick={() => location.reload()}
          className="btn-primary mt-6 inline-flex rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wider"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  const currency = cart.currency;
  const deliveryCharge = cart.charges?.deliveryCharge;

  async function changeQty(lineId: string, quantity: number) {
    if (quantity < 1) return;
    setBusyLine(lineId);
    await setQuantity(lineId, quantity);
    setBusyLine(null);
  }

  async function removeLine(lineId: string) {
    setBusyLine(lineId);
    await remove(lineId);
    setBusyLine(null);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1fr_360px] md:px-8">
      {/* Line items */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-maroon">
            {count} {count === 1 ? "item" : "items"}
          </h2>
          <button
            type="button"
            disabled={clearing}
            onClick={async () => {
              setClearing(true);
              await clear();
              setClearing(false);
            }}
            className="text-xs font-bold uppercase tracking-wider text-charcoal/50 hover:text-chilli disabled:opacity-50"
          >
            Clear cart
          </button>
        </div>

        <ul className="mt-6 divide-y divide-maroon/10">
          {cart.items.map((item) => {
            const busy = busyLine === item.id;
            const img = item.variant.product.image;
            return (
              <li key={item.id} className="flex gap-4 py-5">
                <Link
                  href={`/products/${item.variant.product.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-cream-soft ring-1 ring-maroon/10"
                >
                  {img ? (
                    <Image
                      src={img}
                      alt={item.variant.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      🫙
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/products/${item.variant.product.slug}`}
                    className="font-display font-bold text-maroon hover:text-chilli"
                  >
                    {item.variant.product.name}
                  </Link>
                  <span className="text-xs uppercase tracking-wider text-charcoal/50">
                    {item.variant.name}
                  </span>

                  <div className="mt-3 flex items-center gap-4">
                    <div className="inline-flex items-center rounded-full border-2 border-maroon/15">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={busy || item.quantity <= 1}
                        onClick={() => changeQty(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 font-bold text-maroon disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-maroon">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={busy}
                        onClick={() => changeQty(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 font-bold text-maroon disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => removeLine(item.id)}
                      className="text-xs font-semibold uppercase tracking-wider text-charcoal/50 hover:text-chilli disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right font-display font-bold text-maroon">
                  {formatMoney(item.total, currency)}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Summary */}
      <aside className="h-fit rounded-3xl bg-white p-6 shadow-[0_10px_40px_-20px_rgba(74,10,16,0.4)] ring-1 ring-maroon/10 md:sticky md:top-24">
        <h3 className="font-display text-lg font-bold text-maroon">
          Order summary
        </h3>
        <dl className="mt-5 space-y-3 text-sm">
          <Row label="Subtotal" value={formatMoney(cart.subtotal, currency)} />
          {cart.charges?.packagingCharge &&
            Number(cart.charges.packagingCharge) > 0 && (
              <Row
                label="Packaging"
                value={formatMoney(cart.charges.packagingCharge, currency)}
              />
            )}
          {cart.charges?.taxAmount && Number(cart.charges.taxAmount) > 0 && (
            <Row
              label="Tax"
              value={formatMoney(cart.charges.taxAmount, currency)}
            />
          )}
          <Row
            label="Delivery"
            value={
              deliveryCharge && Number(deliveryCharge) > 0
                ? formatMoney(deliveryCharge, currency)
                : (cart.charges?.deliveryMessage ?? "Calculated at checkout")
            }
          />
        </dl>
        <div className="mt-5 flex items-center justify-between border-t border-maroon/10 pt-5">
          <span className="font-display text-lg font-bold text-maroon">
            Total
          </span>
          <span className="font-display text-xl font-bold text-maroon">
            {formatMoney(cart.total, currency)}
          </span>
        </div>

        <Link
          href="/checkout"
          className="btn-primary mt-6 flex justify-center rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider"
        >
          Proceed to checkout →
        </Link>
        <Link
          href="/category/pickles"
          className="mt-3 flex justify-center text-xs font-semibold uppercase tracking-wider text-charcoal/50 hover:text-chilli"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-charcoal/60">{label}</dt>
      <dd className="font-semibold text-charcoal">{value}</dd>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="mx-auto max-w-2xl px-6 text-center md:px-8">
      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-chilli/10 text-6xl">
        🫙
      </div>
      <h2 className="font-display mt-6 text-3xl font-bold text-maroon md:text-4xl">
        Your basket is empty
      </h2>
      <p className="mt-3 text-charcoal/70">
        Looks like you haven&apos;t added any flavour yet. Start with a jar of
        avakaya or a packet of Guntur karam — your kitchen will thank you.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/category/pickles"
          className="btn-primary rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wider"
        >
          Shop Pickles →
        </Link>
        <Link
          href="/category/karam"
          className="rounded-full border-2 border-maroon px-7 py-3 text-sm font-bold uppercase tracking-wider text-maroon transition-colors hover:bg-maroon hover:text-cream"
        >
          Shop Karam
        </Link>
      </div>
    </div>
  );
}
