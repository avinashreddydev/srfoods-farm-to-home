"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { storefront } from "@/lib/storekit-client";
import { formatPhoneIndia, localDigitsIndia, toE164India } from "../lib/phone";

const RESEND_SECONDS = 30;

type AuthModalContextValue = {
  /** Open the sign-in modal. No-op if the customer is already signed in. */
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

/** Trigger the sign-in drawer/dialog from anywhere under <AuthModalProvider>. */
export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within <AuthModalProvider>");
  }
  return ctx;
}

/**
 * Mounts the global sign-in surface once and exposes `useAuthModal()` to open
 * it. It renders as a bottom drawer on mobile and a centred dialog on desktop —
 * there is no /login route; auth happens in place and the shared session/cart
 * stores update every component (nav, checkout, account) on success.
 */
export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AuthModalContext.Provider value={{ open, close, isOpen }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={close} />
    </AuthModalContext.Provider>
  );
}

function AuthModal({
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
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close sign in"
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          />

          {/* Panel — bottom drawer on mobile, dialog on desktop */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            initial={{ y: 32, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="relative z-10 w-full max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white p-6 pb-8 shadow-[0_-10px_60px_-15px_rgba(74,10,16,0.55)] sm:max-w-md sm:rounded-3xl sm:p-8 sm:shadow-[0_30px_80px_-25px_rgba(74,10,16,0.6)]"
          >
            {/* Mobile grab handle */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-maroon/15 sm:hidden" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 hidden h-9 w-9 items-center justify-center rounded-full text-charcoal/40 transition-colors hover:bg-cream-soft hover:text-charcoal sm:flex"
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

            <AuthPanel isOpen={isOpen} onSuccess={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AuthPanel({
  isOpen,
  onSuccess,
}: {
  isOpen: boolean;
  onSuccess: () => void;
}) {
  const session = storefront.useSession();
  const cart = storefront.useCart();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState(""); // bare 10 local digits
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  // Reset to a clean state each time the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setStep("phone");
    setPhone("");
    setOtp("");
    setError(null);
    setPending(false);
    setCooldown(0);
  }, [isOpen]);

  // If the customer is already signed in, there's nothing to do here.
  useEffect(() => {
    if (isOpen && !session.loading && session.data) onSuccess();
  }, [isOpen, session.loading, session.data, onSuccess]);

  // Resend cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // Focus the active field as the flow advances.
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      if (step === "otp") otpRef.current?.focus();
      else phoneRef.current?.focus();
    }, 120);
    return () => clearTimeout(t);
  }, [isOpen, step]);

  const e164 = toE164India(phone);

  async function sendOtp() {
    if (!e164) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setError(null);
    setPending(true);
    const { error: err } = await storefront.auth.requestOtp(e164);
    setPending(false);
    if (err) {
      setError(err.message ?? "Couldn't send the code. Please try again.");
      return;
    }
    setStep("otp");
    setOtp("");
    setCooldown(RESEND_SECONDS);
  }

  async function verify() {
    if (!e164) return;
    if (otp.length < 4) {
      setError("Enter the code we texted you.");
      return;
    }
    setError(null);
    setPending(true);
    const { error: err } = await storefront.auth.verifyOtp(e164, otp);
    if (err) {
      setPending(false);
      setError(err.message ?? "That code didn't work. Please try again.");
      return;
    }
    // Login claims the guest cart + sets the session cookie. Refresh the shared
    // session/cart stores so the nav, checkout and account update everywhere.
    await Promise.all([session.refresh(), cart.refresh()]);
    setPending(false);
    onSuccess();
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-chilli/10 text-2xl">
          🌶️
        </span>
        <div>
          <h2
            id="auth-modal-title"
            className="font-display text-2xl font-bold text-maroon"
          >
            {step === "phone" ? "Sign in" : "Verify your number"}
          </h2>
          <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">
            SR Foods · Farm to Home
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "phone" ? (
          <motion.form
            key="phone"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            onSubmit={(e) => {
              e.preventDefault();
              void sendOtp();
            }}
            className="mt-7"
          >
            <p className="text-sm text-charcoal/70">
              Enter your mobile number and we&apos;ll text you a one-time code.
              No password needed.
            </p>

            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
                Mobile number
              </span>
              <div className="mt-1.5 flex items-stretch overflow-hidden rounded-xl border-2 border-maroon/15 bg-cream-soft transition-colors focus-within:border-chilli">
                <span className="flex items-center gap-1 border-r-2 border-maroon/15 bg-maroon/5 px-3 text-sm font-semibold text-maroon">
                  🇮🇳 +91
                </span>
                <input
                  ref={phoneRef}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                  value={formatPhoneIndia(phone)}
                  onChange={(e) =>
                    setPhone(localDigitsIndia(e.target.value).slice(0, 10))
                  }
                  className="w-full bg-transparent px-4 py-3 text-sm tracking-wide text-charcoal outline-none"
                />
              </div>
            </label>

            {error && <ErrorNote>{error}</ErrorNote>}

            <button
              type="submit"
              disabled={pending || !e164}
              className="btn-primary mt-6 flex w-full justify-center rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Sending code…" : "Send OTP →"}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="otp"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            onSubmit={(e) => {
              e.preventDefault();
              void verify();
            }}
            className="mt-7"
          >
            <p className="text-sm text-charcoal/70">
              We sent a code to{" "}
              <span className="font-semibold text-maroon">
                +91 {formatPhoneIndia(phone)}
              </span>
              .{" "}
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setError(null);
                  setOtp("");
                }}
                className="font-semibold text-chilli underline underline-offset-2 hover:text-chilli-deep"
              >
                Change
              </button>
            </p>

            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
                One-time code
              </span>
              <input
                ref={otpRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="mt-1.5 w-full rounded-xl border-2 border-maroon/15 bg-cream-soft px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-maroon outline-none transition-colors placeholder:tracking-[0.5em] placeholder:text-maroon/25 focus:border-chilli"
              />
            </label>

            {error && <ErrorNote>{error}</ErrorNote>}

            <button
              type="submit"
              disabled={pending || otp.length < 4}
              className="btn-primary mt-6 flex w-full justify-center rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Verifying…" : "Verify & continue →"}
            </button>

            <div className="mt-4 text-center text-sm text-charcoal/60">
              {cooldown > 0 ? (
                <span>Resend code in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void sendOtp()}
                  className="font-semibold text-chilli hover:text-chilli-deep disabled:opacity-50"
                >
                  Resend code
                </button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="mt-6 text-center text-xs text-charcoal/50">
        By continuing you agree to our terms. We&apos;ll only use your number
        for orders and delivery updates.
      </p>
    </>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-xl bg-chilli/10 px-4 py-3 text-sm font-medium text-chilli">
      {children}
    </p>
  );
}
