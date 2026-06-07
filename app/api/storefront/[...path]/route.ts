import { storekit } from "@/lib/storekit";

/**
 * Same-origin Storekit proxy.
 *
 * Mounts the cart facade (/cart, /cart/items), the auth facade (/auth/*) and a
 * transparent /v1/* proxy. The browser client (lib/storekit-client.ts) calls
 * these routes; the store key + session token are injected here, server-side,
 * and never sent to the browser.
 */
export const { GET, POST, PUT, PATCH, DELETE } = storekit.handler();
