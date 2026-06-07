import { EmptyCategory } from "../components/EmptyCategory";
import { PageBanner } from "../components/PageBanner";
import { ProductCard } from "../components/ProductCard";
import { getProductsByCategory } from "../lib/storefront";

export const metadata = {
  title: "Pickles · SR Foods",
  description:
    "Andhra-style pickles — avakaya, gongura, pandu mirchi — slow-cured in cold-pressed sesame oil.",
};

export default async function PicklesPage() {
  const pickles = await getProductsByCategory("pickles");

  return (
    <>
      <PageBanner
        eyebrow="Our Collection"
        title={
          <>
            The <span className="text-turmeric">Pickle</span> Cellar
          </>
        }
        telugu="ఆవకాయలు · పచ్చళ్ళు"
        subtitle="Slow-cured in earthen jars with cold-pressed sesame oil, hand-pounded mustard, and Guntur red chilli. The kind of pickles you grew up eating."
      />
      <section className="bg-cream py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {pickles.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {pickles.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <EmptyCategory label="pickles" />
          )}
        </div>
      </section>
    </>
  );
}
