"use client";

import type { Address, Order, OrderStatus } from "@usestorekit/sdk/react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { storefront } from "@/lib/storekit-client";
import { formatMoney } from "../lib/format";
import { formatPhoneIndia } from "../lib/phone";
import { useAuthModal } from "./AuthModal";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dateFmt.format(d);
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
      return;
    }
    setEditing(false);
  }

  return (
    <Card
      title="Profile"
      action={
        !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
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
            className="mt-3 inline-flex text-xs font-bold uppercase tracking-wider text-chilli hover:text-chilli-deep"
          >
            Start shopping →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-maroon/10">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-maroon">
                    #{order.id.slice(-6).toUpperCase()}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-1 truncate text-xs text-charcoal/55">
                  {formatDate(order.createdAt)} ·{" "}
                  {order.items
                    .map(
                      (i) =>
                        `${i.product?.name ?? i.variantSnapshot.name} ×${i.quantity}`,
                    )
                    .join(", ")}
                </p>
              </div>
              <span className="font-display font-bold text-maroon">
                {formatMoney(order.total, order.currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
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
            className="text-charcoal/50 hover:text-maroon disabled:opacity-50"
          >
            Set default
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={run(onRemove)}
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
      return;
    }
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
          className="btn-primary rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save address"}
        </button>
        <button
          type="button"
          onClick={onClose}
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
