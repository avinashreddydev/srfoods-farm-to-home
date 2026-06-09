/**
 * Phone helpers for the customer login flow.
 *
 * Storekit's OTP endpoints expect an E.164 number (e.g. `+919876543210`).
 * Our audience is overwhelmingly Indian, so the login UI captures a bare
 * 10-digit number behind a fixed `+91` prefix; these helpers normalise that
 * (and any pasted variants — leading 0, spaces, an existing +91/91) into the
 * canonical form the API wants, and format it back for display.
 */

const INDIA_CC = "91";

/** Strip everything that isn't a digit. */
function digits(input: string): string {
  return input.replace(/\D/g, "");
}

/**
 * Normalise a user-entered Indian phone number to E.164 (`+91XXXXXXXXXX`),
 * or `null` if it isn't a plausible 10-digit Indian mobile number. Accepts
 * `9876543210`, `09876543210`, `+91 98765 43210`, `9198…`, etc.
 */
export function toE164India(input: string): string | null {
  let d = digits(input);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (d.length === 12 && d.startsWith(INDIA_CC)) d = d.slice(2);
  if (d.length !== 10) return null;
  // Indian mobile numbers start 6–9.
  if (!/^[6-9]/.test(d)) return null;
  return `+${INDIA_CC}${d}`;
}

/** The bare 10 local digits of an E.164 (or raw) Indian number, for inputs. */
export function localDigitsIndia(input: string): string {
  const e164 = toE164India(input);
  if (e164) return e164.slice(3);
  return digits(input).slice(-10);
}

/** Pretty national format for display: `98765 43210`. */
export function formatPhoneIndia(input: string): string {
  const local = localDigitsIndia(input);
  if (local.length !== 10) return input;
  return `${local.slice(0, 5)} ${local.slice(5)}`;
}
