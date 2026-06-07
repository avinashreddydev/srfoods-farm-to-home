"use client";

import Link from "next/link";
import { useActionState } from "react";
import { storefront } from "@/lib/storekit-client";
import { type CheckoutState, startCheckout } from "../checkout/actions";
import { formatMoney } from "../lib/format";

const INITIAL: CheckoutState = { error: null };

export function CheckoutForm() {
  const { cart, count, loading } = storefront.useCart();
  const [state, formAction, pending] = useActionState(startCheckout, INITIAL);

  if (loading && !cart) {
    return (
      <p className="mx-auto max-w-2xl px-6 py-10 text-center text-charcoal/60">
        Loading your order…
      </p>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-chilli/10 text-5xl">
          🫙
        </div>
        <h2 className="font-display mt-6 text-2xl font-bold text-maroon">
          Nothing to check out
        </h2>
        <p className="mt-3 text-sm text-charcoal/70">
          Add a jar or two before heading to checkout.
        </p>
        <Link
          href="/pickles"
          className="btn-primary mt-6 inline-flex rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wider"
        >
          Shop Pickles →
        </Link>
      </div>
    );
  }

  const currency = cart.currency;

  return (
    <form
      action={formAction}
      className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1fr_360px] md:px-8"
    >
      {/* Shipping details */}
      <div>
        <h2 className="font-display text-2xl font-bold text-maroon">
          Delivery details
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field name="firstName" label="First name" required />
          <Field name="lastName" label="Last name" />
          <Field
            name="phone"
            label="Phone"
            type="tel"
            className="sm:col-span-2"
          />
          <Field
            name="address"
            label="Address"
            required
            className="sm:col-span-2"
          />
          <Field name="city" label="City" required />
          <Field name="state" label="State" required />
          <Field name="zipCode" label="PIN code" required />
          <Field name="country" label="Country" defaultValue="India" />
          <Field
            name="notes"
            label="Delivery notes (optional)"
            className="sm:col-span-2"
          />
        </div>
        {state.error && (
          <p className="mt-4 rounded-xl bg-chilli/10 px-4 py-3 text-sm font-medium text-chilli">
            {state.error}
          </p>
        )}
      </div>

      {/* Order summary */}
      <aside className="h-fit rounded-3xl bg-white p-6 shadow-[0_10px_40px_-20px_rgba(74,10,16,0.4)] ring-1 ring-maroon/10 md:sticky md:top-24">
        <h3 className="font-display text-lg font-bold text-maroon">
          Your order ({count})
        </h3>
        <ul className="mt-4 space-y-3">
          {cart.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <span className="text-charcoal/80">
                {item.variant.product.name}
                <span className="text-charcoal/40"> × {item.quantity}</span>
              </span>
              <span className="shrink-0 font-semibold text-charcoal">
                {formatMoney(item.total, currency)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 border-t border-maroon/10 pt-5 text-sm">
          <Row label="Subtotal" value={formatMoney(cart.subtotal, currency)} />
          {cart.charges?.taxAmount && Number(cart.charges.taxAmount) > 0 && (
            <Row
              label="Tax"
              value={formatMoney(cart.charges.taxAmount, currency)}
            />
          )}
          {cart.charges?.deliveryCharge &&
            Number(cart.charges.deliveryCharge) > 0 && (
              <Row
                label="Delivery"
                value={formatMoney(cart.charges.deliveryCharge, currency)}
              />
            )}
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-maroon/10 pt-4">
          <span className="font-display text-lg font-bold text-maroon">
            Total
          </span>
          <span className="font-display text-xl font-bold text-maroon">
            {formatMoney(cart.total, currency)}
          </span>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn-primary mt-6 flex w-full justify-center rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Redirecting to payment…" : "Pay securely →"}
        </button>
        <p className="mt-3 text-center text-[11px] text-charcoal/50">
          You&apos;ll be redirected to PhonePe to complete payment.
        </p>
      </aside>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  defaultValue,
  className = "",
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
        {label}
        {required && <span className="text-chilli"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="rounded-xl border-2 border-maroon/15 bg-cream-soft px-4 py-2.5 text-sm text-charcoal outline-none transition-colors focus:border-chilli"
      />
    </label>
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
