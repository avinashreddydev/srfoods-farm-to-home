"use client";

import type { Address, Order, OrderStatus } from "@usestorekit/sdk/react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { storefront } from "@/lib/storekit-client";
import { formatMoney } from "../lib/format";
import { triggerHaptic } from "../lib/haptics";
import { formatPhoneIndia } from "../lib/phone";
import { useAuthModal } from "./AuthModal";
import { useCartSheet } from "./CartSheet";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./responsive-dialog";

type OrderLine = Order["items"][number];

/** Product/variant naming: an item's `variantSnapshot.name` is the size
 * ("250 g", "1 kg"), while the product name lives on `item.product`. */
function lineTitle(item: OrderLine): string {
  return item.product?.name ?? item.variantSnapshot.name;
}

/** A short, readable one-liner for the order list (no mid-word truncation of
 * a single giant string — we summarise instead). */
function summariseItems(items: OrderLine[]): string {
  const names = items.map(lineTitle);
  const shown = names.slice(0, 2).join(", ");
  const extra = names.length - 2;
  return extra > 0 ? `${shown} +${extra} more` : shown;
}

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dateFmt.format(d);
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dateTimeFmt.format(d);
}

function humanize(status: string): string {
  return status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

type StatusTone = "positive" | "pending" | "negative";

function statusTone(status: OrderStatus): StatusTone {
  if (status === "failed" || status === "cancelled" || status === "refunded") {
    return "negative";
  }
  if (status === "pending") return "pending";
  return "positive";
}

/** Map an order's status onto a fulfilment timeline. Pickup orders relabel the
 * last two steps; anything cancelled/refunded skips the tracker entirely. */
function orderProgress(order: Order): { steps: string[]; current: number } {
  const pickup = /pickup/i.test(order.serviceMode ?? order.orderType ?? "");
  const steps = pickup
    ? ["Placed", "Confirmed", "Preparing", "Ready for pickup", "Picked up"]
    : ["Placed", "Confirmed", "Preparing", "Out for delivery", "Delivered"];
  const byStatus: Record<string, number> = {
    pending: 0,
    open: 1,
    paid: 1,
    settled: 1,
    confirmed: 1,
    preparing: 2,
    ready_for_pickup: 3,
    out_for_delivery: 3,
    fulfilled: 4,
    delivered: 4,
  };
  return { steps, current: byStatus[order.status] ?? 1 };
}

export function AccountView() {
  const router = useRouter();
  const session = storefront.useSession();
  const cart = storefront.useCart();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await storefront.auth.logout();
    await Promise.all([session.refresh(), cart.refresh()]);
    router.push("/");
    router.refresh();
  }

  if (session.loading) {
    return (
      <div className="mx-auto max-w-3xl px-6">
        <div className="h-40 animate-pulse rounded-3xl bg-white/70 ring-1 ring-maroon/10" />
      </div>
    );
  }

  if (!session.data) return <SignedOut />;

  const customer = session.data;
  const greeting = customer.name?.trim().split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-3xl px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-chilli">
            Namaste 🙏
          </p>
          <h1 className="font-display text-3xl font-bold text-maroon md:text-4xl">
            Hi, {greeting}
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">
            +91 {formatPhoneIndia(customer.phone)}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          data-haptic="warning"
          className="rounded-full border-2 border-maroon/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-maroon transition-colors hover:border-chilli hover:text-chilli disabled:opacity-50"
        >
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>

      <div className="mt-8 space-y-6">
        <ProfileCard />
        <OrdersCard />
        <AddressesCard />
      </div>
    </div>
  );
}

function SignedOut() {
  const { open } = useAuthModal();
  return (
    <div className="mx-auto max-w-md px-6 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-chilli/10 text-5xl">
        🔐
      </div>
      <h1 className="font-display mt-6 text-2xl font-bold text-maroon">
        You&apos;re not signed in
      </h1>
      <p className="mt-3 text-sm text-charcoal/70">
        Sign in with your mobile number to see your orders, saved addresses and
        check out faster.
      </p>
      <button
        type="button"
        onClick={open}
        data-haptic="medium"
        className="btn-primary mt-6 inline-flex rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wider"
      >
        Sign in →
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------------- */

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_-20px_rgba(74,10,16,0.4)] ring-1 ring-maroon/10 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-maroon">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ProfileCard() {
  const session = storefront.useSession();
  const customer = session.data;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(customer?.name ?? "");
    setEmail(customer?.email ?? "");
  }, [customer?.name, customer?.email]);

  if (!customer) return null;

  async function save() {
    setSaving(true);
    setError(null);
    const { error: err } = await session.update({
      name: name.trim() || undefined,
      email: email.trim() || undefined,
    });
    setSaving(false);
    if (err) {
      setError(err.message ?? "Couldn't save your details.");
      triggerHaptic("error");
      return;
    }
    setEditing(false);
    triggerHaptic("success");
  }

  return (
    <Card
      title="Profile"
      action={
        !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            data-haptic="light"
            className="text-xs font-bold uppercase tracking-wider text-chilli hover:text-chilli-deep"
          >
            Edit
          </button>
        )
      }
    >
      {editing ? (
        <div className="grid gap-4">
          <TextField
            label="Full name"
            value={name}
            onChange={setName}
            placeholder="Lakshmi Devi"
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@email.com"
          />
          {error && (
            <p className="rounded-xl bg-chilli/10 px-4 py-3 text-sm font-medium text-chilli">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              data-haptic="light"
              className="btn-primary rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
                setName(customer.name ?? "");
                setEmail(customer.email ?? "");
              }}
              data-haptic="light"
              className="rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-charcoal/50 hover:text-charcoal"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <dl className="grid gap-4 sm:grid-cols-3">
          <Detail label="Name" value={customer.name || "—"} />
          <Detail
            label="Mobile"
            value={`+91 ${formatPhoneIndia(customer.phone)}`}
          />
          <Detail label="Email" value={customer.email || "—"} />
        </dl>
      )}
    </Card>
  );
}

function OrdersCard() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    storefront.customer.orders
      .list({ limit: 20 })
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setError(err.message ?? "Couldn't load your orders.");
        else setOrders(data?.data ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card title="Orders">
      {error ? (
        <p className="text-sm text-chilli">{error}</p>
      ) : orders === null ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-2xl bg-cream-soft" />
          <div className="h-16 animate-pulse rounded-2xl bg-cream-soft" />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-charcoal/60">No orders yet.</p>
          <Link
            href="/category/pickles"
            data-haptic="light"
            className="mt-3 inline-flex text-xs font-bold uppercase tracking-wider text-chilli hover:text-chilli-deep"
          >
            Start shopping →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-maroon/10">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function OrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const count = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <li>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            data-haptic="medium"
            className="group -mx-3 flex w-full items-center gap-3 rounded-2xl px-3 py-4 text-left transition-colors hover:bg-cream-soft/60"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-maroon">
                  #{order.id.slice(-6).toUpperCase()}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-1 truncate text-xs text-charcoal/55">
                {formatDate(order.createdAt)} · {count}{" "}
                {count === 1 ? "item" : "items"} · {summariseItems(order.items)}
              </p>
            </div>
            <span className="font-display font-bold text-maroon">
              {formatMoney(order.total, order.currency)}
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="shrink-0 text-maroon/25 transition-colors group-hover:text-chilli"
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <OrderDetails order={order} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </li>
  );
}

function OrderDetails({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const { add } = storefront.useCart();
  const { open: openCart } = useCartSheet();
  const [reordering, setReordering] = useState(false);

  const count = order.items.reduce((n, i) => n + i.quantity, 0);
  const currency = order.currency;
  const discount = order.discountAmount ?? 0;
  // Anything the merchant added on top of items-minus-discount (tax, delivery,
  // packaging) — derived so the breakdown always reconciles to the total.
  const extraCharges = Math.max(0, order.total - order.subtotal + discount);
  const tone = statusTone(order.status);
  const needsPayment =
    !!order.paymentRedirectUrl &&
    (order.status === "pending" || order.status === "failed");
  const reorderable = order.items.filter((i) => i.variantId);

  async function reorder() {
    if (reordering || reorderable.length === 0) return;
    setReordering(true);
    for (const item of reorderable) {
      if (item.variantId) {
        await add({ variantId: item.variantId, quantity: item.quantity });
      }
    }
    setReordering(false);
    // Lands as the cart sheet slides in with the re-added items.
    triggerHaptic("success");
    onClose();
    openCart();
  }

  return (
    <>
      <DialogHeader>
        <div className="flex flex-wrap items-center gap-2.5">
          <DialogTitle>#{order.id.slice(-6).toUpperCase()}</DialogTitle>
          <StatusBadge status={order.status} />
        </div>
        <DialogDescription>
          Placed {formatDateTime(order.createdAt)} · {count}{" "}
          {count === 1 ? "item" : "items"}
        </DialogDescription>
      </DialogHeader>

      {tone !== "positive" && <StatusBanner order={order} tone={tone} />}
      {tone !== "negative" && <OrderTracker order={order} />}

      <DeliveryInfo order={order} />

      <SectionLabel>
        {count} {count === 1 ? "item" : "items"}
      </SectionLabel>
      <ul className="divide-y divide-maroon/10">
        {order.items.map((item) => {
          const img = item.product?.image;
          return (
            <li key={item.id} className="flex items-center gap-4 py-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-soft ring-1 ring-maroon/10">
                {img ? (
                  <Image
                    src={img}
                    alt={lineTitle(item)}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl">
                    🫙
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-maroon">
                  {lineTitle(item)}
                </p>
                <p className="mt-0.5 text-xs text-charcoal/55">
                  {item.product && <span>{item.variantSnapshot.name} · </span>}
                  {formatMoney(item.unitPrice, currency)} × {item.quantity}
                </p>
              </div>
              <span className="shrink-0 font-display font-bold text-maroon">
                {formatMoney(item.total, currency)}
              </span>
            </li>
          );
        })}
      </ul>

      <SectionLabel>Payment summary</SectionLabel>
      <dl className="space-y-2.5 text-sm">
        <SummaryRow
          label="Item subtotal"
          value={formatMoney(order.subtotal, currency)}
        />
        {discount > 0 && (
          <SummaryRow
            label={
              order.appliedCouponCode
                ? `Discount (${order.appliedCouponCode})`
                : "Discount"
            }
            value={`− ${formatMoney(discount, currency)}`}
            accent
          />
        )}
        {extraCharges > 0 && (
          <SummaryRow
            label="Taxes & charges"
            value={formatMoney(extraCharges, currency)}
          />
        )}
        <div className="flex items-center justify-between border-t border-maroon/10 pt-3">
          <span className="font-display text-base font-bold text-maroon">
            Total
          </span>
          <span className="font-display text-lg font-bold text-maroon">
            {formatMoney(order.total, currency)}
          </span>
        </div>
      </dl>

      {order.notes && (
        <div className="mt-5 rounded-2xl bg-cream-soft/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal/45">
            Order note
          </p>
          <p className="mt-1 text-sm text-charcoal/75">{order.notes}</p>
        </div>
      )}

      <div className="mt-3 text-[11px] text-charcoal/40">
        Order ID {order.id}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {needsPayment && (
          <a
            href={order.paymentRedirectUrl ?? "#"}
            data-haptic="medium"
            className="btn-primary flex justify-center rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wider"
          >
            Complete payment →
          </a>
        )}
        {order.trackingUrl && (
          <a
            href={order.trackingUrl}
            target="_blank"
            rel="noreferrer"
            data-haptic="light"
            className="flex justify-center rounded-full border-2 border-maroon px-6 py-3 text-sm font-bold uppercase tracking-wider text-maroon transition-colors hover:bg-maroon hover:text-cream"
          >
            Track order →
          </a>
        )}
        {reorderable.length > 0 && (
          <button
            type="button"
            onClick={reorder}
            disabled={reordering}
            data-haptic="light"
            className={
              needsPayment
                ? "flex justify-center rounded-full border-2 border-maroon px-6 py-3 text-sm font-bold uppercase tracking-wider text-maroon transition-colors hover:bg-maroon hover:text-cream disabled:opacity-60"
                : "btn-primary flex justify-center rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-60"
            }
          >
            {reordering ? "Adding to basket…" : "Reorder items →"}
          </button>
        )}
        <div className="flex items-center justify-center gap-4 pt-1 text-xs font-bold uppercase tracking-wider">
          <Link
            href="/contact"
            data-haptic="light"
            className="text-charcoal/50 transition-colors hover:text-chilli"
          >
            Need help?
          </Link>
          <span className="text-maroon/15">·</span>
          <DialogClose className="text-charcoal/50 transition-colors hover:text-chilli">
            Close
          </DialogClose>
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 mb-2 border-t border-maroon/10 pt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-charcoal/45">
      {children}
    </h3>
  );
}

function OrderTracker({ order }: { order: Order }) {
  const { steps, current } = orderProgress(order);

  return (
    <ol className="mt-5 rounded-2xl bg-cream-soft/50 p-5">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const isLast = i === steps.length - 1;
        return (
          <li key={label} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 ${
                  done
                    ? "bg-chilli text-cream ring-chilli"
                    : active
                      ? "bg-cream text-chilli ring-2 ring-chilli"
                      : "bg-cream text-transparent ring-maroon/15"
                }`}
              >
                {done ? (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span
                    className={`h-2 w-2 rounded-full ${active ? "bg-chilli" : "bg-maroon/20"}`}
                  />
                )}
              </span>
              {!isLast && (
                <span
                  className={`my-1 w-0.5 flex-1 ${done ? "bg-chilli" : "bg-maroon/15"}`}
                  style={{ minHeight: "1.25rem" }}
                />
              )}
            </div>
            <div className={isLast ? "pb-0" : "pb-1"}>
              <p
                className={`text-sm font-semibold ${
                  done || active ? "text-maroon" : "text-charcoal/40"
                }`}
              >
                {label}
              </p>
              {active && (
                <p className="mt-0.5 text-xs text-charcoal/55">
                  {humanize(order.status)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StatusBanner({ order, tone }: { order: Order; tone: StatusTone }) {
  const COPY: Record<string, string> = {
    pending: "Awaiting payment — complete it to confirm this order.",
    failed: "Payment failed. Retry the payment to confirm this order.",
    cancelled: "This order was cancelled.",
    refunded: "This order was refunded to your original payment method.",
  };
  const cls =
    tone === "pending"
      ? "bg-turmeric/15 text-maroon"
      : order.status === "refunded"
        ? "bg-charcoal/[0.06] text-charcoal/70"
        : "bg-chilli/10 text-chilli";

  return (
    <p className={`mt-5 rounded-2xl px-4 py-3 text-sm font-medium ${cls}`}>
      {COPY[order.status] ?? humanize(order.status)}
    </p>
  );
}

function DeliveryInfo({ order }: { order: Order }) {
  const mode = order.serviceMode ?? order.orderType;
  const rows: Array<{ label: string; value: string }> = [];
  if (mode) rows.push({ label: "Fulfilment", value: humanize(mode) });
  if (order.estimatedDelivery) {
    rows.push({
      label: "Estimated delivery",
      value: formatDate(order.estimatedDelivery),
    });
  }
  if (order.estimatedReadyAt) {
    rows.push({
      label: "Ready by",
      value: formatDateTime(order.estimatedReadyAt),
    });
  }
  if (order.deliveredAt) {
    rows.push({ label: "Delivered", value: formatDateTime(order.deliveredAt) });
  }
  if (order.deliveryPartner) {
    rows.push({ label: "Courier", value: order.deliveryPartner });
  }
  if (rows.length === 0) return null;

  return (
    <>
      <SectionLabel>Delivery</SectionLabel>
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-charcoal/45">
              {r.label}
            </dt>
            <dd className="mt-0.5 text-sm text-charcoal">{r.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function SummaryRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-charcoal/60">{label}</dt>
      <dd
        className={`font-semibold ${accent ? "text-chilli" : "text-charcoal"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function AddressesCard() {
  const addr = storefront.useAddresses();
  const [adding, setAdding] = useState(false);

  return (
    <Card
      title="Saved addresses"
      action={
        !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            data-haptic="light"
            className="text-xs font-bold uppercase tracking-wider text-chilli hover:text-chilli-deep"
          >
            + Add
          </button>
        )
      }
    >
      {adding && (
        <AddressForm
          onClose={() => setAdding(false)}
          onSubmit={(input) => addr.create(input)}
        />
      )}

      {addr.loading && addr.addresses.length === 0 ? (
        <div className="h-20 animate-pulse rounded-2xl bg-cream-soft" />
      ) : addr.addresses.length === 0 && !adding ? (
        <p className="py-2 text-sm text-charcoal/60">
          No saved addresses yet — add one for faster checkout.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addr.addresses.map((a) => (
            <AddressRow
              key={a.id}
              address={a}
              onRemove={() => addr.remove(a.id)}
              onMakeDefault={() => addr.update(a.id, { isDefault: true })}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

function AddressRow({
  address,
  onRemove,
  onMakeDefault,
}: {
  address: Address;
  onRemove: () => Promise<unknown>;
  onMakeDefault: () => Promise<unknown>;
}) {
  const [busy, setBusy] = useState(false);
  const run = (fn: () => Promise<unknown>) => async () => {
    setBusy(true);
    await fn();
    setBusy(false);
  };

  return (
    <li className="relative rounded-2xl border-2 border-maroon/10 bg-cream-soft/50 p-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-bold text-maroon">
          {address.label ||
            `${address.firstName} ${address.lastName ?? ""}`.trim()}
        </span>
        {address.isDefault && (
          <span className="rounded-full bg-turmeric/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-maroon">
            Default
          </span>
        )}
      </div>
      <p className="mt-1.5 text-charcoal/70">
        {address.address}, {address.city}, {address.state} {address.zipCode}
      </p>
      {address.phone && (
        <p className="text-charcoal/55">📞 {formatPhoneIndia(address.phone)}</p>
      )}
      <div className="mt-3 flex gap-4 text-[11px] font-bold uppercase tracking-wider">
        {!address.isDefault && (
          <button
            type="button"
            disabled={busy}
            onClick={run(onMakeDefault)}
            data-haptic="selection"
            className="text-charcoal/50 hover:text-maroon disabled:opacity-50"
          >
            Set default
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={run(onRemove)}
          data-haptic="warning"
          className="text-charcoal/50 hover:text-chilli disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </li>
  );
}

function AddressForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: {
    firstName: string;
    lastName?: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    label?: string;
  }) => Promise<{ error: unknown } & Record<string, unknown>>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(formData: FormData) {
    const get = (k: string) => String(formData.get(k) ?? "").trim();
    const firstName = get("firstName");
    const address = get("address");
    const city = get("city");
    const state = get("state");
    const zipCode = get("zipCode");
    if (!firstName || !address || !city || !state || !zipCode) {
      setError("Please fill in name, address, city, state and PIN.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: err } = await onSubmit({
      firstName,
      lastName: get("lastName") || undefined,
      phone: get("phone") || undefined,
      address,
      city,
      state,
      zipCode,
      country: get("country") || "India",
      label: get("label") || undefined,
    });
    setSaving(false);
    if (err) {
      setError(
        (err as { message?: string }).message ?? "Couldn't save address.",
      );
      triggerHaptic("error");
      return;
    }
    triggerHaptic("success");
    onClose();
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      action={handle}
      className="mb-5 grid gap-3 rounded-2xl border-2 border-dashed border-maroon/15 p-4 sm:grid-cols-2"
    >
      <FormField
        name="label"
        label="Label (Home, Work…)"
        className="sm:col-span-2"
      />
      <FormField name="firstName" label="First name" required />
      <FormField name="lastName" label="Last name" />
      <FormField
        name="phone"
        label="Phone"
        type="tel"
        className="sm:col-span-2"
      />
      <FormField
        name="address"
        label="Address"
        required
        className="sm:col-span-2"
      />
      <FormField name="city" label="City" required />
      <FormField name="state" label="State" required />
      <FormField name="zipCode" label="PIN code" required />
      <FormField name="country" label="Country" defaultValue="India" />
      {error && (
        <p className="sm:col-span-2 rounded-xl bg-chilli/10 px-4 py-2.5 text-sm font-medium text-chilli">
          {error}
        </p>
      )}
      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={saving}
          data-haptic="light"
          className="btn-primary rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save address"}
        </button>
        <button
          type="button"
          onClick={onClose}
          data-haptic="light"
          className="rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-charcoal/50 hover:text-charcoal"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}

/* ----------------------------------------------------------------------- */

const STATUS_STYLES: Partial<Record<OrderStatus, string>> = {
  paid: "bg-emerald-100 text-emerald-700",
  settled: "bg-emerald-100 text-emerald-700",
  delivered: "bg-emerald-100 text-emerald-700",
  fulfilled: "bg-emerald-100 text-emerald-700",
  preparing: "bg-turmeric/25 text-maroon",
  ready_for_pickup: "bg-turmeric/25 text-maroon",
  out_for_delivery: "bg-turmeric/25 text-maroon",
  open: "bg-turmeric/25 text-maroon",
  pending: "bg-charcoal/10 text-charcoal/70",
  failed: "bg-chilli/15 text-chilli",
  cancelled: "bg-chilli/15 text-chilli",
  refunded: "bg-chilli/15 text-chilli",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cls = STATUS_STYLES[status] ?? "bg-charcoal/10 text-charcoal/70";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wider text-charcoal/45">
        {label}
      </dt>
      <dd className="mt-0.5 text-charcoal">{value}</dd>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border-2 border-maroon/15 bg-cream-soft px-4 py-2.5 text-sm text-charcoal outline-none transition-colors focus:border-chilli"
      />
    </label>
  );
}

function FormField({
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
