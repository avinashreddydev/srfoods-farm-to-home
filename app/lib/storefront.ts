import "server-only";
import type {
  Category as SKCategory,
  Page as SKPage,
  Product as SKProduct,
} from "@usestorekit/sdk/next";
import { cache } from "react";
import { storekit } from "@/lib/storekit";
import type {
  StoreCategory,
  StorePage,
  StorePageSummary,
  StoreProduct,
  StoreVariant,
} from "./types";

const DEFAULT_CURRENCY = "INR";

// Storekit returns prices as decimal strings ("349.00"); normalise to numbers.
function toNumber(value: string | null | undefined): number {
  if (value == null) return 0;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function toNullableNumber(value: string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

// Heat is stored as a string attribute ("5"); clamp to a 0–5 integer.
function clampHeat(value: string | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n)));
}

type CategoryMeta = { slug: string; name: string };

/**
 * Store currency, cached per request. Falls back to INR if the store call
 * fails (e.g. before credentials are configured).
 */
export const getStoreCurrency = cache(async (): Promise<string> => {
  const { data, error } = await storekit.store.get();
  if (error || !data) return DEFAULT_CURRENCY;
  return data.currency || DEFAULT_CURRENCY;
});

/** Map of categoryId -> { slug, name }, cached per request. */
export const getCategoryMap = cache(
  async (): Promise<Map<string, CategoryMeta>> => {
    const map = new Map<string, CategoryMeta>();
    const { data, error } = await storekit.categories.list();
    if (error || !data) return map;
    for (const c of data.categories) {
      map.set(c.id, { slug: c.slug, name: c.name });
    }
    return map;
  },
);

/** Top-level categories (e.g. Pickles, Karam), cached per request. */
export const getCategories = cache(async () => {
  const { data, error } = await storekit.categories.list();
  if (error || !data) return [];
  return data.categories;
});

function mapCategory(c: SKCategory): StoreCategory {
  const attrs = (c.attributes ?? {}) as Record<string, string>;
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    telugu: attrs.telugu ?? attrs.te ?? null,
    description: c.description,
    image: c.imageUrl,
    position: c.position,
    productCount: c.totalActiveProducts ?? null,
  };
}

/**
 * Top-level categories as the nav/homepage collections — ordered by their
 * dashboard `position` and capped at `limit` (default 2: Pickles & Karam).
 * Driven entirely by Storekit so adding a collection in the dashboard surfaces
 * it across the site without code changes.
 */
export const getCollections = cache(
  async (limit = 2): Promise<StoreCategory[]> => {
    const cats = await getCategories();
    return cats
      .filter((c) => c.parentId == null)
      .sort((a, b) => a.position - b.position)
      .slice(0, limit)
      .map(mapCategory);
  },
);

function mapVariant(v: SKProduct["variants"][number]): StoreVariant {
  const attributes = (v.attributes ?? {}) as Record<string, string>;
  return {
    id: v.id,
    name: v.name,
    price: toNumber(v.price),
    compareAtPrice: toNullableNumber(v.compareAtPrice),
    sku: v.sku,
    inventoryQty: v.inventoryQty,
    weight: attributes.weight ?? attributes.size ?? v.name ?? null,
    attributes,
  };
}

// Map a Storekit product onto our UI view-model. Brand fields (telugu/heat/
// weight) come from the default (first) variant's `attributes`.
function mapProduct(
  p: SKProduct,
  currency: string,
  categoryMap: Map<string, CategoryMeta>,
): StoreProduct {
  const variants = p.variants.map(mapVariant);
  const primary = variants[0] ?? null;
  const attrs = (p.variants[0]?.attributes ?? {}) as Record<string, string>;
  const category = categoryMap.get(p.categoryId) ?? null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    telugu: attrs.telugu ?? attrs.te ?? null,
    description: p.description ?? "",
    categoryId: p.categoryId,
    category: category?.slug ?? null,
    categoryName: category?.name ?? null,
    heat: clampHeat(attrs.heat),
    weight: attrs.weight ?? primary?.weight ?? null,
    image: p.images[0] ?? null,
    images: p.images,
    price: primary?.price ?? 0,
    compareAtPrice: primary?.compareAtPrice ?? null,
    currency,
    variantId: primary?.id ?? "",
    variants,
    isAvailable: p.isAvailable,
    isBestseller: p.isBestseller,
    isFeatured: p.isFeatured,
  };
}

/**
 * Best sellers for the homepage. Prefers products flagged bestseller/featured
 * in Storekit, and falls back to the first `limit` active products.
 */
export const getBestSellers = cache(
  async (limit = 6): Promise<StoreProduct[]> => {
    const [currency, categoryMap] = await Promise.all([
      getStoreCurrency(),
      getCategoryMap(),
    ]);
    const { data, error } = await storekit.products.list({
      limit: 50,
      status: "active",
    });
    if (error || !data) return [];
    const mapped = data.data.map((p) => mapProduct(p, currency, categoryMap));
    const featured = mapped.filter((p) => p.isBestseller || p.isFeatured);
    return (featured.length ? featured : mapped).slice(0, limit);
  },
);

/** All active products in a category (by slug), e.g. "pickles" or "karam". */
export const getProductsByCategory = cache(
  async (categorySlug: string, limit = 100): Promise<StoreProduct[]> => {
    const [currency, categoryMap] = await Promise.all([
      getStoreCurrency(),
      getCategoryMap(),
    ]);
    const { data, error } = await storekit.products.list({
      categorySlug,
      limit,
      status: "active",
    });
    if (error || !data) return [];
    return data.data.map((p) => mapProduct(p, currency, categoryMap));
  },
);

/** A single product by slug, or null if not found / not configured. */
export const getProduct = cache(
  async (slug: string): Promise<StoreProduct | null> => {
    const [currency, categoryMap] = await Promise.all([
      getStoreCurrency(),
      getCategoryMap(),
    ]);
    const { data, error } = await storekit.products.get(slug);
    if (error || !data) return null;
    return mapProduct(data, currency, categoryMap);
  },
);

/** Other products from the same category, excluding `slug`. */
export const getRelatedProducts = cache(
  async (
    categorySlug: string,
    excludeSlug: string,
    limit = 3,
  ): Promise<StoreProduct[]> => {
    const all = await getProductsByCategory(categorySlug);
    return all.filter((p) => p.slug !== excludeSlug).slice(0, limit);
  },
);

// Storekit stores page bodies as a free-form `content` blob. Our pages use the
// rich-text shape `{ html: "<…>" }`; fall back to a plain `body` string if a
// page was authored differently, otherwise render nothing.
function extractHtml(content: Record<string, unknown>): string {
  const html = content?.html;
  if (typeof html === "string") return html;
  const body = content?.body;
  if (typeof body === "string") return body;
  return "";
}

function mapPage(p: SKPage): StorePage {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    template: p.template,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    content: p.content,
    html: extractHtml(p.content),
  };
}

/** All CMS content pages (FAQ, policies, …), cached per request. */
export const getPages = cache(async (): Promise<StorePageSummary[]> => {
  const { data, error } = await storekit.pages.list();
  if (error || !data) return [];
  return data.pages;
});

/** A single content page by slug, or null if not found / not configured. */
export const getPage = cache(
  async (slug: string): Promise<StorePage | null> => {
    const { data, error } = await storekit.pages.get(slug);
    if (error || !data) return null;
    return mapPage(data);
  },
);
