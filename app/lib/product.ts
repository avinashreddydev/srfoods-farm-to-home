import type { Product } from "@usestorekit/sdk";

// Heat is the one product attribute worth a shared helper: it's stored as a
// free-form string ("5") on the product's `attributes` map and must be parsed
// and clamped to a 0–5 integer in several places, so we keep that logic in one
// spot. Everything else (price parsing, the per-variant weight/size label, the
// Telugu name) is read straight off the SDK's `attributes` map at each call site.

/** 0–5 heat, read from the product's `heat` attribute (0 if unset). */
export function productHeat(p: Product): number {
  const n = Number(p.attributes.heat);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n)));
}
