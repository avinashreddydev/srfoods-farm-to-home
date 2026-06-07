// Generates seed/sr-foods-catalog.csv from seed/sr-foods-catalog.json.
// One simple row per product (default pack). Run: node seed/json-to-csv.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(
  readFileSync(join(here, "sr-foods-catalog.json"), "utf8"),
);

const COLUMNS = [
  "name",
  "slug",
  "category",
  "description",
  "price",
  "compare_at_price",
  "weight",
  "telugu",
  "heat",
  "sku",
  "stock",
  "image",
  "bestseller",
  "featured",
];

// Pick the default pack to list (largest standard size first).
const WEIGHT_ORDER = ["500 g", "250 g", "100 g", "1 kg"];
function defaultVariant(p) {
  return (
    [...p.variants].sort(
      (a, b) =>
        WEIGHT_ORDER.indexOf(a.attributes.weight) -
        WEIGHT_ORDER.indexOf(b.attributes.weight),
    )[0] ?? p.variants[0]
  );
}

// RFC 4180 escaping.
function cell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

const rows = [COLUMNS.join(",")];
for (const p of catalog.products) {
  const v = defaultVariant(p);
  rows.push(
    [
      p.name,
      p.slug,
      p.category,
      p.description,
      v.price,
      v.compareAtPrice ?? "",
      v.attributes.weight,
      v.attributes.telugu,
      v.attributes.heat,
      v.sku,
      v.inventoryQty,
      p.images[0],
      p.isBestseller,
      p.isFeatured,
    ]
      .map(cell)
      .join(","),
  );
}

writeFileSync(join(here, "sr-foods-catalog.csv"), `${rows.join("\n")}\n`, "utf8");
console.log(`Wrote sr-foods-catalog.csv — ${rows.length - 1} product rows.`);
