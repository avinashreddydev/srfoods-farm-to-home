import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBanner } from "../../components/PageBanner";
import { getPage, getPages } from "../../lib/storefront";

// Prerender every CMS page at build time; pages added later in the Storekit
// dashboard are rendered on first request (dynamicParams defaults to true).
export async function generateStaticParams() {
  const pages = await getPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page not found · SR Foods" };
  return {
    title: `${page.seoTitle ?? page.title} · SR Foods`,
    description:
      page.seoDescription ?? `${page.title} — SR Foods, Farm to Home.`,
  };
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <>
      <PageBanner
        eyebrow="SR Foods · Farm to Home"
        title={page.title}
        subtitle={page.seoDescription ?? undefined}
      />

      <section className="bg-cream py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-6 md:px-8">
          <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-wider text-charcoal/50">
            <Link href="/" data-haptic="light" className="hover:text-chilli">
              Home
            </Link>
            <span>/</span>
            <span className="text-maroon">{page.title}</span>
          </nav>

          {page.html ? (
            // Content is authored in the Storekit dashboard (trusted source).
            <article
              className="prose-spice"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted CMS HTML from Storekit
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          ) : (
            <p className="text-charcoal/60">
              This page has no content yet. Please check back soon.
            </p>
          )}

          <p className="mt-12 border-t border-maroon/10 pt-6 text-xs uppercase tracking-wider text-charcoal/40">
            Last updated {dateFormatter.format(new Date(page.updatedAt))}
          </p>
        </div>
      </section>
    </>
  );
}
