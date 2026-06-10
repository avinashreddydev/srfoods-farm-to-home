"use client";

// Single shared WebHaptics instance for the whole site. Most UI declares its
// feedback via `data-haptic="<kind>"` (picked up by <HapticEngine/>); use
// `triggerHaptic()` directly only for async outcomes (success/error) where the
// haptic must fire when the result arrives, not on the tap.

import { defaultPatterns, WebHaptics } from "web-haptics";

export type HapticKind = keyof typeof defaultPatterns;

const KINDS = new Set(Object.keys(defaultPatterns));

// Debug plays an audible click per pulse — lets you "hear" the haptics on
// desktop, where the Vibration API is unavailable. Flip to false to silence.
const DEBUG_SOUNDS = true;

let engine: WebHaptics | null = null;

export function triggerHaptic(kind?: string): void {
  if (typeof window === "undefined") return;
  engine ??= new WebHaptics({ debug: DEBUG_SOUNDS });
  // Unknown/empty values fall back to the default medium impact.
  void engine.trigger(
    kind && KINDS.has(kind) ? (kind as HapticKind) : undefined,
  );
}
