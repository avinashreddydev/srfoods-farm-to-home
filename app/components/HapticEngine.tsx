"use client";

import { useEffect } from "react";
import { triggerHaptic } from "../lib/haptics";

/**
 * Global, declarative haptics. Mounted once in the root layout; any element —
 * server- or client-rendered — opts in with a data attribute and this engine
 * fires the matching pulse via event delegation:
 *
 *   data-haptic="selection"        → pulse on click/tap
 *   data-haptic-input="selection"  → pulse on every input event (e.g. OTP digits)
 *
 * The value is a web-haptics preset (light · medium · heavy · selection ·
 * success · warning · error · …); an empty value means the default medium
 * impact. Async outcomes (saved ✓ / failed ✗) can't be declarative — those
 * call `triggerHaptic()` from `app/lib/haptics` when the result lands.
 */
export function HapticEngine() {
  useEffect(() => {
    const find = (e: Event, attr: string): HTMLElement | null => {
      const target = e.target;
      if (!(target instanceof Element)) return null;
      return target.closest<HTMLElement>(`[${attr}]`);
    };

    const onClick = (e: Event) => {
      const el = find(e, "data-haptic");
      // Disabled controls give no visual response, so no buzz either.
      if (!el || el.matches(":disabled, [aria-disabled='true']")) return;
      triggerHaptic(el.dataset.haptic);
    };

    const onInput = (e: Event) => {
      const el = find(e, "data-haptic-input");
      if (el) triggerHaptic(el.dataset.hapticInput);
    };

    // Capture phase: fires even when a handler stops propagation, and stays in
    // sync with the visual change React applies in the bubbling handler.
    document.addEventListener("click", onClick, true);
    document.addEventListener("input", onInput, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("input", onInput, true);
    };
  }, []);

  return null;
}
