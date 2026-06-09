// View-model types for the storefront. Pure types only (no runtime, no
// "server-only") so both Server and Client Components can import them.
//
// Products, variants and categories are consumed straight from Storekit's SDK
// types (`Product`, `ProductVariant`, `Category` from "@usestorekit/sdk").
// Product-level brand fields (telugu, heat) are read from the product's own
// `attributes` map; the size/weight label is per-variant, read from each
// variant's `attributes`. See app/lib/product.ts for the heat helper.
//
// Pages keep a view-model because their body must be extracted from Storekit's
// free-form `content` blob into rendered HTML (see app/lib/storefront.ts).

// A Storekit CMS content page (e.g. FAQ, Shipping & Returns, Privacy Policy).
// Mapped from the SDK's `pages` resource in app/lib/storefront.ts.

/** Lightweight page record from `pages.list()` — no body. */
export type StorePageSummary = {
  id: string;
  slug: string;
  title: string;
  /** Layout hint set in the dashboard, e.g. "default" | "contact". */
  template: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
};

/** Full page from `pages.get(slug)`, including the rendered body. */
export type StorePage = StorePageSummary & {
  createdAt: string;
  /** Rich-text HTML body extracted from `content.html` ("" if the page has none). */
  html: string;
  /** Raw, free-form content blob as returned by Storekit. */
  content: Record<string, unknown>;
};
