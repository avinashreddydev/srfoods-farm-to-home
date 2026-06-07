"use client";
import { createStorekitClient } from "@usestorekit/sdk/react";

/**
 * Browser Storekit client.
 *
 * Talks to our own same-origin `/api/storefront/*` proxy (mounted in
 * app/api/storefront/[...path]/route.ts), which injects the store key and the
 * httpOnly session cookie server-side. Provides the shared-state hooks
 * (`useCart`, `useStore`, `useSession`, `usePaymentConfirmation`) used across
 * client components, so e.g. the nav cart badge updates the instant any
 * component adds an item.
 */
export const storefront = createStorekitClient();
