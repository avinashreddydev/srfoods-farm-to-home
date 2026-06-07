import "server-only";
import { initStorekit } from "@usestorekit/sdk/next";

/**
 * Server-side Storekit instance.
 *
 * Talks to the Storekit Storefront API directly (store key is injected
 * server-side and never reaches the browser). Use it in Server Components,
 * `generateMetadata`, Server Actions, and the catch-all proxy route.
 *
 * Reads credentials from STOREFRONT_STORE_KEY / STOREFRONT_URL /
 * STOREFRONT_API_URL / STOREFRONT_OUTLET_ID. We pass `baseURL` explicitly so
 * the post-payment redirect always comes back to our own domain.
 */
export const storekit = initStorekit({
  baseURL: process.env.STOREFRONT_URL,
});
