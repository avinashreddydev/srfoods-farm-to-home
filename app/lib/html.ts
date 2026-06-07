// Storekit returns product descriptions as rich-text HTML. These helpers let us
// render that safely in both Server and Client Components without a DOM:
// `stripHtml` for compact plain-text previews (cards), the raw string for full
// rich rendering via dangerouslySetInnerHTML on detail pages.

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

/** Flatten rich-text HTML into a single line of plain text for previews. */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}
