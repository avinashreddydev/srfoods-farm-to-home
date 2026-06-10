import Link from "next/link";
import { Hero } from "./components/Hero";
import { ProductCard } from "./components/ProductCard";
import { SectionHeading } from "./components/Section";
import { getBestSellers, getCollections } from "./lib/storefront";
import { CollectionCards } from "./components/CollectionCards";
import { WhyUs } from "./components/WhyUs";
import { Testimonials } from "./components/Testimonials";
import { BrandStory } from "./components/BrandStory";

export default async function Home() {
  const [bestSellers, collections] = await Promise.all([
    getBestSellers(6),
    getCollections(2),
  ]);

  return (
    <>
      <Hero />

      <section className="bg-cream py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionHeading
            eyebrow="Our Collections"
            title={
              <>
                Two Worlds of <span className="text-chilli">Flavour</span>
              </>
            }
            subtitle="From slow-cured pickles to stone-ground karam — explore the bold tastes of Andhra."
          />
          <div className="mt-12">
            <CollectionCards collections={collections} />
          </div>
        </div>
      </section>

      <BrandStory />

      <section className="bg-cream-soft py-20 md:py-28 bg-spice-grain">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionHeading
            eyebrow="Best Sellers"
            title={
              <>
                Loved Across <span className="text-chilli">Andhra Homes</span>
              </>
            }
            subtitle="Hand-picked favourites our regulars keep coming back for."
          />
          {bestSellers.length > 0 ? (
            <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3">
              {bestSellers.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-center text-charcoal/60">
              Our shelves are being restocked. Please check back shortly.
            </p>
          )}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {collections.map((c, i) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                data-haptic="medium"
                className={
                  i === 0
                    ? "btn-primary inline-flex rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wider"
                    : "rounded-full border-2 border-maroon px-7 py-3 text-sm font-bold uppercase tracking-wider text-maroon hover:bg-maroon hover:text-cream transition-colors"
                }
              >
                View All {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WhyUs />
      <Testimonials />
    </>
  );
}
