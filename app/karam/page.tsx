import { EmptyCategory } from "../components/EmptyCategory";
import { PageBanner } from "../components/PageBanner";
import { ProductCard } from "../components/ProductCard";
import { getProductsByCategory } from "../lib/storefront";

export const metadata = {
  title: "Karam · SR Foods",
  description:
    "Hand-pounded Andhra karam powders — Guntur mirchi, vellulli, sambhar masala. Bold heat, deep aroma.",
};

export default async function KaramPage() {
  const karam = await getProductsByCategory("karam");

  return (
    <>
      <PageBanner
        eyebrow="Our Collection"
        title={
          <>
            The <span className="text-turmeric">Karam</span> Pantry
          </>
        }
        telugu="కారం · మసాలాలు"
        subtitle="Stone-ground in small batches with sun-dried Guntur chillies and freshly roasted spices. Heat with depth, never just burn."
      />
      <section className="bg-cream py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {karam.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {karam.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <EmptyCategory label="karam" />
          )}
        </div>
      </section>
    </>
  );
}
