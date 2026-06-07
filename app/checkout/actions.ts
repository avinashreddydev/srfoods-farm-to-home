"use server";

import { redirect } from "next/navigation";
import { storekit } from "@/lib/storekit";

export type CheckoutState = { error: string | null };

/**
 * Creates a Storekit checkout for the current (cookie-stateful) cart and
 * redirects the browser to the PhonePe hosted payment page. After payment the
 * customer is returned to /payment/callback on this storefront.
 */
export async function startCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const shipping = {
    firstName: get("firstName"),
    lastName: get("lastName") || undefined,
    address: get("address"),
    city: get("city"),
    state: get("state"),
    zipCode: get("zipCode"),
    country: get("country") || "India",
  };

  if (
    !shipping.firstName ||
    !shipping.address ||
    !shipping.city ||
    !shipping.state ||
    !shipping.zipCode
  ) {
    return { error: "Please fill in all required fields." };
  }

  const phone = get("phone");
  const note = get("notes");
  // Storekit's shipping schema has no phone field, so surface contact details
  // (and any delivery note) via order notes.
  const notes =
    [note, phone ? `Phone: ${phone}` : ""].filter(Boolean).join(" · ") ||
    undefined;

  const { data, error } = await storekit.checkout.create({
    orderType: "delivery",
    shipping,
    notes,
  });

  if (error) {
    return {
      error: error.message ?? "We couldn't start checkout. Please try again.",
    };
  }
  if (!data?.redirectUrl) {
    return {
      error: "Payment could not be initiated. Please try again in a moment.",
    };
  }

  // Hand off to the PhonePe hosted page (external redirect).
  redirect(data.redirectUrl);
}
