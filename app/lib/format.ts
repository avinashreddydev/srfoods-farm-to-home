// Isomorphic money formatter — re-exported from Storekit's framework-agnostic
// entry so the same helper works in both Server and Client Components. The
// locale is pinned internally to avoid hydration mismatches.
export { formatMoney } from "@usestorekit/sdk";
