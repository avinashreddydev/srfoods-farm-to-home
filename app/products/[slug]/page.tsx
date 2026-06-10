import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartPanel } from "../../components/AddToCartPanel";
import { ProductCard } from "../../components/ProductCard";
import { SectionHeading } from "../../components/Section";
import { productHeat } from "../../lib/product";
import {
  getCategoryMap,
  getProduct,
  getRelatedProducts,
} from "../../lib/storefront";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found · SR Foods" };
  return {
    title: `${product.name} · SR Foods`,
    description: product.description || `${product.name} from SR Foods.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, categoryMap] = await Promise.all([
    getProduct(slug),
    getCategoryMap(),
  ]);
  if (!product) notFound();

  const category = categoryMap.get(product.categoryId) ?? null;
  const heat = productHeat(product);
  const telugu = product.attributes.telugu;
  const variant = product.variants[0];
  const weight =
    variant?.attributes.weight ??
    variant?.attributes.size ??
    variant?.name ??
    null;
  const related = category
    ? await getRelatedProducts(category.slug, product.slug, 3)
    : [];

  return (
    <>
      <section className="bg-cream py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-wider text-charcoal/50">
            <Link href="/" data-haptic="light" className="hover:text-chilli">
              Home
            </Link>
            <span>/</span>
            {category && (
              <>
                <Link
                  href={`/category/${category.slug}`}
                  data-haptic="light"
                  className="capitalize hover:text-chilli"
                >
                  {category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-maroon">{product.name}</span>
          </nav>

          <div className="grid gap-10 md:grid-cols-2 md:gap-14">
            <ProductGallery
              images={product.images}
              name={product.name}
              heat={heat}
            />

            <div className="flex flex-col">
              {telugu && (
                <span className="font-display text-lg italic text-chilli">
                  {telugu}
                </span>
              )}
              <h1 className="font-display text-4xl font-black leading-tight text-maroon md:text-5xl">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                {heat > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-maroon/5 px-3 py-1 font-semibold text-maroon">
                    Heat {"🌶️".repeat(heat)}
                  </span>
                )}
                {weight && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-maroon/5 px-3 py-1 font-semibold text-maroon">
                    {weight}
                  </span>
                )}
                {product.isAvailable ? (
                  <span className="text-emerald-700">● In stock</span>
                ) : (
                  <span className="text-charcoal/50">● Sold out</span>
                )}
              </div>

              {product.description && (
                <div
                  className="mt-6 text-base leading-relaxed text-charcoal/75 [&_a]:text-chilli [&_a]:underline [&_h2]:mt-5 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-maroon [&_h3]:mt-4 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-maroon [&_li]:mb-1 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-maroon [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}

              <div className="mt-8 border-t border-maroon/10 pt-8">
                <AddToCartPanel product={product} />
              </div>

              <ul className="mt-8 grid grid-cols-2 gap-3 text-sm text-charcoal/70">
                <li className="flex items-center gap-2">✓ 100% Homemade</li>
                <li className="flex items-center gap-2">✓ No preservatives</li>
                <li className="flex items-center gap-2">✓ Cold-pressed oils</li>
                <li className="flex items-center gap-2">✓ Doorstep delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-cream-soft py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <SectionHeading
              eyebrow="You might also like"
              title={
                <>
                  More from <span className="text-chilli">this shelf</span>
                </>
              }
            />
            <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function ProductGallery({
  images,
  name,
  heat,
}: {
  images: string[];
  name: string;
  heat: number;
}) {
  const primary = images[0];
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-cream-soft ring-1 ring-maroon/10">
        {primary ? (
          <Image
            src={primary}
            alt={name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-chilli/15 to-maroon/15 text-7xl">
            🫙
          </div>
        )}
        {heat > 0 && (
          <div className="absolute left-4 top-4 rounded-full bg-maroon/85 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cream backdrop-blur">
            {"🌶️".repeat(heat)}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.slice(0, 4).map((src, i) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded-xl bg-cream-soft ring-1 ring-maroon/10"
            >
              <Image
                src={src}
                alt={`${name} ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
