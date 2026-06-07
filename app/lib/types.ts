// UI view-model types for the storefront. Pure types only (no runtime, no
// "server-only") so both Server and Client Components can import them.
//
// These are mapped from Storekit's API types in app/lib/storefront.ts. The
// brand-specific fields (telugu, heat, weight) are read from a Storekit product
// variant's `attributes` map — that's where we store them in the dashboard,
// since the core product model has no free-form metadata field.

export type StoreVariant = {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  inventoryQty: number;
  weight: string | null;
  attributes: Record<string, string>;
};

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

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  /** Telugu name, from variant attribute `telugu`. */
  telugu: string | null;
  description: string;
  categoryId: string;
  /** Resolved category slug, e.g. "pickles" | "karam". */
  category: string | null;
  categoryName: string | null;
  /** 0–5, from variant attribute `heat`. */
  heat: number;
  /** e.g. "500 g", from variant attribute `weight` (falls back to variant name). */
  weight: string | null;
  /** Primary image URL served by Storekit (null if the product has none). */
  image: string | null;
  images: string[];
  /** Default (first) variant price, in major currency units. */
  price: number;
  compareAtPrice: number | null;
  currency: string;
  /** Default variant id — what add-to-cart sends. */
  variantId: string;
  variants: StoreVariant[];
  isAvailable: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
};
