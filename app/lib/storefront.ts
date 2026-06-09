import "server-only";
import type { Category, Page as SKPage, Product } from "@usestorekit/sdk/next";
import { cache } from "react";
import { storekit } from "@/lib/storekit";
import type { StorePage, StorePageSummary } from "./types";

type CategoryMeta = { slug: string; name: string };

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
export const getCategories = cache(async (): Promise<Category[]> => {
  const { data, error } = await storekit.categories.list();
  if (error || !data) return [];
  return data.categories;
});

/**
 * Top-level categories as the nav/homepage collections — ordered by their
 * dashboard `position` and capped at `limit` (default 2: Pickles & Karam).
 * Driven entirely by Storekit so adding a collection in the dashboard surfaces
 * it across the site without code changes.
 */
export const getCollections = cache(async (limit = 2): Promise<Category[]> => {
  const cats = await getCategories();
  return cats
    .filter((c) => c.parentId == null)
    .sort((a, b) => a.position - b.position)
    .slice(0, limit);
});

/** A single category by slug for the /category/[slug] route, or null. */
export const getCategory = cache(
  async (slug: string): Promise<Category | null> => {
    const cats = await getCategories();
    return cats.find((c) => c.slug === slug) ?? null;
  },
);

/**
 * Best sellers for the homepage. Prefers products flagged bestseller/featured
 * in Storekit, and falls back to the first `limit` active products.
 */
export const getBestSellers = cache(async (limit = 6): Promise<Product[]> => {
  const { data, error } = await storekit.products.list({
    limit: 50,
    status: "active",
  });
  if (error || !data) return [];
  const featured = data.data.filter((p) => p.isBestseller || p.isFeatured);
  return (featured.length ? featured : data.data).slice(0, limit);
});

/** All active products in a category (by slug), e.g. "pickles" or "karam". */
export const getProductsByCategory = cache(
  async (categorySlug: string, limit = 100): Promise<Product[]> => {
    const { data, error } = await storekit.products.list({
      categorySlug,
      limit,
      status: "active",
    });
    if (error || !data) return [];
    return data.data;
  },
);

/** A single product by slug, or null if not found / not configured. */
export const getProduct = cache(
  async (slug: string): Promise<Product | null> => {
    const { data, error } = await storekit.products.get(slug);
    if (error || !data) return null;
    return data;
  },
);

/** Other products from the same category, excluding `slug`. */
export const getRelatedProducts = cache(
  async (
    categorySlug: string,
    excludeSlug: string,
    limit = 3,
  ): Promise<Product[]> => {
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
