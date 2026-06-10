"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { storefront } from "@/lib/storekit-client";
import { useAuthModal } from "./AuthModal";
import { useCartSheet } from "./CartSheet";

type NavLink = { href: string; label: string };

export function Nav({ categories = [] }: { categories?: NavLink[] }) {
  // Home and the static CMS pages are fixed; the collections in between
  // (Pickles, Karam, …) are driven by Storekit via the root layout.
  const links: NavLink[] = [
    { href: "/", label: "Home" },
    ...categories,
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];
  const pathname = usePathname();
  const { count } = storefront.useCart();
  const { data: customer, loading: sessionLoading } = storefront.useSession();
  const { open: openLogin } = useAuthModal();
  const { open: openCart } = useCartSheet();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const firstName = customer?.name?.trim().split(" ")[0];
  const accountActive = pathname.startsWith("/account");
  const accountClass = `group hidden items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors sm:inline-flex ${
    accountActive
      ? "border-turmeric/60 text-turmeric"
      : "border-cream/25 text-cream/90 hover:border-turmeric/50 hover:text-turmeric"
  }`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-maroon/95 backdrop-blur-md shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]"
          : "bg-maroon"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
        <Link href="/" data-haptic="light" className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-turmeric/70">
            <Image
              src="/logo.png"
              alt="SR Foods"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-wide text-cream">
              SR FOODS
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-turmeric">
              Farm to Home
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                data-haptic="selection"
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "text-turmeric" : "text-cream/85 hover:text-turmeric"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-chilli-deep/60 ring-1 ring-turmeric/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {!sessionLoading &&
            (customer ? (
              <Link
                href="/account"
                data-haptic="light"
                className={accountClass}
              >
                <UserIcon />
                <span className="max-w-[7rem] truncate">
                  {firstName ?? "Account"}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                data-haptic="medium"
                className={accountClass}
              >
                <UserIcon />
                <span>Login</span>
              </button>
            ))}
          <button
            type="button"
            onClick={openCart}
            data-haptic="medium"
            aria-label="Open cart"
            className="group relative inline-flex items-center gap-2 rounded-full bg-turmeric px-4 py-2 text-sm font-semibold text-maroon shadow-[0_4px_0_#7a5e10] transition-transform hover:-translate-y-0.5"
          >
            <CartIcon />
            <span className="hidden sm:inline">Cart</span>
            <span className="rounded-full bg-maroon px-1.5 py-0.5 text-[10px] font-bold text-turmeric">
              {count}
            </span>
          </button>
          <button
            type="button"
            aria-label="Toggle menu"
            data-haptic="light"
            onClick={() => setOpen((s) => !s)}
            className="md:hidden rounded-full p-2 text-cream"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d={open ? "M6 6l12 12M6 18L18 6" : "M3 6h18M3 12h18M3 18h18"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="md:hidden overflow-hidden border-t border-chilli-deep/50 bg-maroon"
        >
          <div className="flex flex-col px-5 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                data-haptic="selection"
                className="rounded-lg px-3 py-3 text-cream hover:bg-chilli-deep/40"
              >
                {l.label}
              </Link>
            ))}
            {customer ? (
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                data-haptic="light"
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-turmeric hover:bg-chilli-deep/40"
              >
                <UserIcon />
                {firstName ?? "My Account"}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openLogin();
                }}
                data-haptic="medium"
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-turmeric hover:bg-chilli-deep/40"
              >
                <UserIcon />
                Login / Sign up
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4.5 19.5a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 4h2l2.4 12.3a2 2 0 002 1.7h8.2a2 2 0 002-1.6L21 8H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="21" r="1.5" fill="currentColor" />
      <circle cx="18" cy="21" r="1.5" fill="currentColor" />
    </svg>
  );
}
