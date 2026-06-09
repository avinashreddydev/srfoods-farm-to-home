import { notFound } from "next/navigation";
import { EmptyCategory } from "../../components/EmptyCategory";
import { PageBanner } from "../../components/PageBanner";
import { ProductCard } from "../../components/ProductCard";
import {
  getCategories,
  getCategory,
  getProductsByCategory,
} from "../../lib/storefront";

// Prerender every category at build time; categories added later in the
// Storekit dashboard are rendered on first request (dynamicParams defaults to
// true).
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Collection not found · SR Foods" };
  return {
    title: `${category.name} · SR Foods`,
    description:
      category.description ??
      `Shop ${category.name} from SR Foods — Farm to Home.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, products] = await Promise.all([
    getCategory(slug),
    getProductsByCategory(slug),
  ]);
  if (!category) notFound();

  return (
    <>
      <PageBanner
        eyebrow="Our Collection"
        title={category.name}
        telugu={category.attributes?.telugu}
        subtitle={category.description ?? undefined}
      />
      <section className="bg-cream py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <EmptyCategory label={category.name} />
          )}
        </div>
      </section>
    </>
  );
}
