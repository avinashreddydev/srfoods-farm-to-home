"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { storefront } from "@/lib/storekit-client";
import { formatMoney } from "../lib/format";

type CartSheetContextValue = {
  /** Slide the cart drawer in. */
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const CartSheetContext = createContext<CartSheetContextValue | null>(null);

/** Open/close the cart drawer from anywhere under <CartSheetProvider>. */
export function useCartSheet(): CartSheetContextValue {
  const ctx = useContext(CartSheetContext);
  if (!ctx) {
    throw new Error("useCartSheet must be used within <CartSheetProvider>");
  }
  return ctx;
}

/**
 * Mounts the cart as a right-hand slide-out sheet once and exposes
 * `useCartSheet()` to open it. There is no /cart route — the basket lives in
 * place and the shared cart store keeps the nav badge and drawer in sync.
 */
export function CartSheetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Close on navigation (product link, checkout, "shop pickles", …) so the
  // drawer never lingers over a freshly loaded page.
  const pathname = usePathname();
  // biome-ignore lint/correctness/useExhaustiveDependencies: close when the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <CartSheetContext.Provider value={{ open, close, isOpen }}>
      {children}
      <CartSheet isOpen={isOpen} onClose={close} />
    </CartSheetContext.Provider>
  );
}

/** A link-styled button that opens the cart drawer (for server components). */
export function CartSheetLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useCartSheet();
  return (
    <button
      type="button"
      onClick={open}
      data-haptic="medium"
      className={className}
    >
      {children}
    </button>
  );
}

function CartSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close cart"
            onClick={onClose}
            data-haptic="light"
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          />

          {/* Panel — full-height drawer from the right */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-cream shadow-[-20px_0_60px_-20px_rgba(74,10,16,0.55)]"
          >
            <CartBody onClose={onClose} />
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CartBody({ onClose }: { onClose: () => void }) {
  const { cart, count, loading, error, setQuantity, remove, clear } =
    storefront.useCart();
  const [busyLine, setBusyLine] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

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

  const hasItems = !!cart && cart.items.length > 0;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-maroon/10 px-5 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-bold text-maroon">
            Your basket
          </h2>
          {count > 0 && (
            <span className="rounded-full bg-chilli/10 px-2 py-0.5 text-xs font-bold text-chilli">
              {count}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close cart"
          data-haptic="light"
          className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal/50 transition-colors hover:bg-cream-soft hover:text-charcoal"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Body */}
      {loading && !cart ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-charcoal/60">
          Loading your basket…
        </div>
      ) : error && !cart ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <p className="text-chilli">We couldn&apos;t load your cart.</p>
          <button
            type="button"
            onClick={() => location.reload()}
            data-haptic="medium"
            className="btn-primary inline-flex rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wider"
          >
            Try again
          </button>
        </div>
      ) : !hasItems ? (
        <EmptyCart onClose={onClose} />
      ) : (
        <div className="flex-1 overflow-y-auto px-5 md:px-6">
          <div className="flex justify-end py-3">
            <button
              type="button"
              disabled={clearing}
              onClick={async () => {
                setClearing(true);
                await clear();
                setClearing(false);
              }}
              data-haptic="warning"
              className="text-xs font-bold uppercase tracking-wider text-charcoal/50 hover:text-chilli disabled:opacity-50"
            >
              Clear cart
            </button>
          </div>
          <ul className="divide-y divide-maroon/10">
            {cart.items.map((item) => {
              const busy = busyLine === item.id;
              const img = item.variant.product.image;
              return (
                <li key={item.id} className="flex gap-4 py-4">
                  <Link
                    href={`/products/${item.variant.product.slug}`}
                    onClick={onClose}
                    data-haptic="light"
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
                      onClick={onClose}
                      data-haptic="light"
                      className="font-display font-bold leading-snug text-maroon hover:text-chilli"
                    >
                      {item.variant.product.name}
                    </Link>
                    <span className="text-xs uppercase tracking-wider text-charcoal/50">
                      {item.variant.name}
                    </span>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-full border-2 border-maroon/15">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={busy || item.quantity <= 1}
                          onClick={() => changeQty(item.id, item.quantity - 1)}
                          data-haptic="selection"
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
                          data-haptic="selection"
                          className="px-3 py-1.5 font-bold text-maroon disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removeLine(item.id)}
                        data-haptic="warning"
                        className="text-xs font-semibold uppercase tracking-wider text-charcoal/50 hover:text-chilli disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right font-display font-bold text-maroon">
                    {formatMoney(item.total, cart.currency)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Summary footer */}
      {hasItems && <CartSummary cart={cart} onClose={onClose} />}
    </>
  );
}

function CartSummary({
  cart,
  onClose,
}: {
  cart: NonNullable<ReturnType<typeof storefront.useCart>["cart"]>;
  onClose: () => void;
}) {
  const currency = cart.currency;
  const deliveryCharge = cart.charges?.deliveryCharge;

  return (
    <div className="border-t border-maroon/10 bg-white px-5 py-5 shadow-[0_-10px_30px_-20px_rgba(74,10,16,0.4)] md:px-6">
      <dl className="space-y-2.5 text-sm">
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
      <div className="mt-4 flex items-center justify-between border-t border-maroon/10 pt-4">
        <span className="font-display text-lg font-bold text-maroon">
          Total
        </span>
        <span className="font-display text-xl font-bold text-maroon">
          {formatMoney(cart.total, currency)}
        </span>
      </div>

      <Link
        href="/checkout"
        onClick={onClose}
        data-haptic="medium"
        className="btn-primary mt-5 flex justify-center rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider"
      >
        Proceed to checkout →
      </Link>
      <button
        type="button"
        onClick={onClose}
        data-haptic="light"
        className="mt-3 flex w-full justify-center text-xs font-semibold uppercase tracking-wider text-charcoal/50 hover:text-chilli"
      >
        Continue shopping
      </button>
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

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-chilli/10 text-5xl">
        🫙
      </div>
      <h3 className="font-display mt-6 text-2xl font-bold text-maroon">
        Your basket is empty
      </h3>
      <p className="mt-3 text-sm text-charcoal/70">
        Looks like you haven&apos;t added any flavour yet. Start with a jar of
        avakaya or a packet of Guntur karam.
      </p>
      <div className="mt-7 flex w-full flex-col gap-3">
        <Link
          href="/category/pickles"
          onClick={onClose}
          data-haptic="medium"
          className="btn-primary rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wider"
        >
          Shop Pickles →
        </Link>
        <Link
          href="/category/karam"
          onClick={onClose}
          data-haptic="light"
          className="rounded-full border-2 border-maroon px-7 py-3 text-sm font-bold uppercase tracking-wider text-maroon transition-colors hover:bg-maroon hover:text-cream"
        >
          Shop Karam
        </Link>
      </div>
    </div>
  );
}
