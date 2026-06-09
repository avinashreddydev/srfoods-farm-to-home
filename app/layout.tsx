import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthModalProvider } from "./components/AuthModal";
import { Footer } from "./components/Footer";
import { Nav } from "./components/Nav";
import { getCollections } from "./lib/storefront";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SR Foods — Spicy & Authentic Andhra Pickles & Karam",
  description:
    "Hand-crafted Guntur Mirchi karam, avakaya, gongura and pandu mirchi pickles. Farm-to-home Andhra flavours, shipped across India.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const collections = await getCollections(2);
  const categoryLinks = collections.map((c) => ({
    href: `/category/${c.slug}`,
    label: c.name,
  }));

  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-charcoal">
        <AuthModalProvider>
          <Nav categories={categoryLinks} />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthModalProvider>
      </body>
    </html>
  );
}
