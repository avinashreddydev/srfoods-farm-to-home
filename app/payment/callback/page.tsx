"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { storefront } from "@/lib/storekit-client";
import { useCartSheet } from "../../components/CartSheet";
import { formatMoney } from "../../lib/format";

export const dynamic = "force-dynamic";

function Result() {
  const orderId = useSearchParams().get("orderId");
  const { open: openCart } = useCartSheet();
  const { status, order, message, retry } =
    storefront.usePaymentConfirmation(orderId);

  if (status === "processing") {
    return (
      <Shell emoji="⏳" tone="neutral" title="Confirming your payment…">
        <p className="text-charcoal/70">
          Hang tight while we reconcile your order. This only takes a moment.
        </p>
      </Shell>
    );
  }

  if (status === "success") {
    return (
      <Shell emoji="🎉" tone="success" title="Order placed!">
        <p className="text-charcoal/70">
          Thank you for shopping with SR Foods. Your spices are on their way.
        </p>
        {order && (
          <p className="mt-3 font-display text-lg font-bold text-maroon">
            Total {formatMoney(order.total, order.currency)}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="btn-primary rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wider"
          >
            Back home
          </Link>
          <Link
            href="/category/pickles"
            className="rounded-full border-2 border-maroon px-7 py-3 text-sm font-bold uppercase tracking-wider text-maroon transition-colors hover:bg-maroon hover:text-cream"
          >
            Keep shopping
          </Link>
        </div>
      </Shell>
    );
  }

  if (status === "pending") {
    return (
      <Shell emoji="🕗" tone="neutral" title="Payment is still processing">
        <p className="text-charcoal/70">
          {message ?? "We haven't received final confirmation yet."}
        </p>
        <button
          type="button"
          onClick={retry}
          className="btn-primary mt-8 inline-flex rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wider"
        >
          Check again
        </button>
      </Shell>
    );
  }

  // "failed" | "error"
  return (
    <Shell emoji="😔" tone="error" title="Payment could not be confirmed">
      <p className="text-charcoal/70">
        {message ?? "Something went wrong while confirming your payment."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={retry}
          className="btn-primary rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wider"
        >
          Retry
        </button>
        <button
          type="button"
          onClick={openCart}
          className="rounded-full border-2 border-maroon px-7 py-3 text-sm font-bold uppercase tracking-wider text-maroon transition-colors hover:bg-maroon hover:text-cream"
        >
          Back to cart
        </button>
      </div>
    </Shell>
  );
}

function Shell({
  emoji,
  title,
  tone,
  children,
}: {
  emoji: string;
  title: string;
  tone: "success" | "error" | "neutral";
  children: React.ReactNode;
}) {
  const ring =
    tone === "success"
      ? "bg-emerald-50"
      : tone === "error"
        ? "bg-chilli/10"
        : "bg-turmeric/15";
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center md:py-32">
      <div
        className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full text-6xl ${ring}`}
      >
        {emoji}
      </div>
      <h1 className="font-display mt-8 text-3xl font-bold text-maroon md:text-4xl">
        {title}
      </h1>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <section className="bg-cream">
      <Suspense
        fallback={
          <div className="mx-auto max-w-xl px-6 py-24 text-center text-charcoal/60">
            Loading…
          </div>
        }
      >
        <Result />
      </Suspense>
    </section>
  );
}
