import Image from "next/image";
import Link from "next/link";
import { getPages } from "../lib/storefront";

// CMS pages that already have a bespoke top-level route — link those instead of
// the generic /pages/<slug> renderer.
const CANONICAL_HREF: Record<string, string> = {
  about: "/about",
  contact: "/contact",
};

function pageHref(slug: string): string {
  return CANONICAL_HREF[slug] ?? `/pages/${slug}`;
}

export async function Footer() {
  const pages = await getPages();

  return (
    <footer className="mt-24 bg-charcoal text-cream/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-5 md:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-turmeric/70">
              <Image src="/logo.png" alt="SR Foods" fill sizes="48px" />
            </div>
            <div className="font-display text-xl font-bold text-cream">
              SR FOODS
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            Spicy &amp; authentic Andhra pickles and karam, hand-crafted in
            small batches and shipped farm-to-home.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-display text-sm uppercase tracking-widest text-turmeric">
            Shop
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/category/pickles" className="hover:text-turmeric">
                Pickles
              </Link>
            </li>
            <li>
              <Link href="/category/karam" className="hover:text-turmeric">
                Karam Powders
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-turmeric">
                Cart
              </Link>
            </li>
          </ul>
        </div>

        {pages.length > 0 && (
          <div>
            <h4 className="mb-3 font-display text-sm uppercase tracking-widest text-turmeric">
              Information
            </h4>
            <ul className="space-y-2 text-sm">
              {pages.map((page) => (
                <li key={page.id}>
                  <Link
                    href={pageHref(page.slug)}
                    className="hover:text-turmeric"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="mb-3 font-display text-sm uppercase tracking-widest text-turmeric">
            Contact
          </h4>
          <ul className="space-y-2 text-sm">
            <li>Guntur, Andhra Pradesh</li>
            <li>+91 98765 43210</li>
            <li>hello@srfoods.in</li>
          </ul>
          <div className="mt-4 flex gap-3">
            {["Instagram", "Facebook", "YouTube"].map((s) => (
              <a
                key={s}
                href="#"
                className="rounded-full border border-cream/20 px-3 py-1 text-xs hover:border-turmeric hover:text-turmeric"
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-display text-sm uppercase tracking-widest text-turmeric">
            Newsletter
          </h4>
          <p className="text-sm">
            Get new flavours, recipes and offers straight to your inbox.
          </p>
          <form className="mt-3 flex overflow-hidden rounded-full bg-cream/10 ring-1 ring-cream/20">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-transparent px-4 py-2 text-sm placeholder:text-cream/40 focus:outline-none"
            />
            <button
              type="button"
              className="bg-turmeric px-4 text-sm font-semibold text-maroon"
            >
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-cream/50 md:flex-row md:px-8">
          <span>
            © {new Date().getFullYear()} SR Foods. All rights reserved.
          </span>
          <span>Crafted with fire in Andhra Pradesh.</span>
        </div>
      </div>
    </footer>
  );
}
