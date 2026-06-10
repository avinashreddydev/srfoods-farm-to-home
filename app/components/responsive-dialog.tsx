"use client";

/**
 * Responsive dialog — a bottom drawer on phones and a centred dialog on
 * desktop, built on `motion/react` + a portal (no Radix/vaul in this project).
 *
 * The pieces compose like a regular shadcn `Dialog`:
 *
 *   <Dialog>
 *     <DialogTrigger asChild><button>Open</button></DialogTrigger>
 *     <DialogContent className="sm:max-w-md">
 *       <DialogHeader>
 *         <DialogTitle>Title</DialogTitle>
 *         <DialogDescription>Subtitle</DialogDescription>
 *       </DialogHeader>
 *       …body…
 *       <DialogFooter>
 *         <DialogClose asChild><button>Close</button></DialogClose>
 *       </DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 *
 * It can be uncontrolled (with a trigger) or controlled via `open` /
 * `onOpenChange`. Escape, backdrop click, body-scroll lock and focus handling
 * are all wired up by <DialogContent>.
 */

import { AnimatePresence, motion } from "motion/react";
import {
  cloneElement,
  createContext,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(component: string): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error(`<${component}> must be used within <Dialog>`);
  return ctx;
}

export function Dialog({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const id = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [hasDescription, setHasDescription] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return (
    <DialogContext.Provider
      value={{
        open,
        setOpen,
        titleId: `${id}-title`,
        descriptionId: `${id}-description`,
        hasDescription,
        setHasDescription,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

/** Minimal `asChild` slot — clones the child and merges our onClick onto it. */
type Clickable = ReactElement<{ onClick?: (e: MouseEvent) => void }>;

function withTrigger(
  children: ReactNode,
  asChild: boolean,
  className: string | undefined,
  onActivate: () => void,
  haptic: string,
) {
  if (asChild && isValidElement(children)) {
    const child = children as Clickable;
    return cloneElement(child, {
      onClick: (e: MouseEvent) => {
        child.props.onClick?.(e);
        onActivate();
      },
    });
  }
  return (
    <button
      type="button"
      onClick={onActivate}
      data-haptic={haptic}
      className={className}
    >
      {children}
    </button>
  );
}

export function DialogTrigger({
  children,
  asChild = false,
  className,
}: {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}) {
  const { setOpen } = useDialogContext("DialogTrigger");
  return withTrigger(
    children,
    asChild,
    className,
    () => setOpen(true),
    "medium",
  );
}

export function DialogClose({
  children,
  asChild = false,
  className,
}: {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}) {
  const { setOpen } = useDialogContext("DialogClose");
  return withTrigger(
    children,
    asChild,
    className,
    () => setOpen(false),
    "light",
  );
}

export function DialogContent({
  children,
  className = "sm:max-w-lg",
  showClose = true,
}: {
  children: ReactNode;
  className?: string;
  showClose?: boolean;
}) {
  const { open } = useDialogContext("DialogContent");

  // Portals need a DOM target — only render after mount (SSR-safe).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <DialogSurface className={className} showClose={showClose}>
          {children}
        </DialogSurface>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function DialogSurface({
  children,
  className,
  showClose,
}: {
  children: ReactNode;
  className: string;
  showClose: boolean;
}) {
  const { setOpen, titleId, descriptionId, hasDescription } =
    useDialogContext("DialogContent");
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), [setOpen]);

  // Escape to close, lock body scroll, move focus in, restore it on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
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
  }, [close]);

  // Keep Tab focus inside the dialog.
  function trapFocus(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
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

  return (
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
        aria-label="Close"
        onClick={close}
        data-haptic="light"
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
      />

      {/* Panel — bottom drawer on mobile, centred dialog on desktop */}
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={hasDescription ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={trapFocus}
        initial={{ y: 32, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 32, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-3xl bg-white p-6 pb-8 shadow-[0_-10px_60px_-15px_rgba(74,10,16,0.55)] outline-none sm:rounded-3xl sm:p-8 sm:shadow-[0_30px_80px_-25px_rgba(74,10,16,0.6)] ${className}`}
      >
        {/* Mobile grab handle */}
        <div className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-maroon/15 sm:hidden" />

        {showClose && (
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            data-haptic="light"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-charcoal/40 transition-colors hover:bg-cream-soft hover:text-charcoal"
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
        )}

        {children}
      </motion.div>
    </motion.div>
  );
}

export function DialogHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 pr-10 ${className}`}>{children}</div>
  );
}

export function DialogFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end ${className}`}
    >
      {children}
    </div>
  );
}

export function DialogTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { titleId } = useDialogContext("DialogTitle");
  return (
    <h2
      id={titleId}
      className={`font-display text-2xl font-bold text-maroon ${className}`}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { descriptionId, setHasDescription } =
    useDialogContext("DialogDescription");

  // Let <DialogContent> know to wire `aria-describedby` only when present.
  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  return (
    <p id={descriptionId} className={`text-sm text-charcoal/60 ${className}`}>
      {children}
    </p>
  );
}
