"use client";

import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { useEffect } from "react";
import { ErrorScreen } from "./components/ErrorScreen";

// global-error replaces the root layout when it crashes, so it has to bring its
// own fonts + global styles (Nav/Footer aren't available here by design).
const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const actionBase =
  "inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream text-charcoal">
        {/* Metadata exports aren't supported in global-error, so set the title here. */}
        <title>Something went wrong — SR Foods</title>
        <ErrorScreen
          code="500"
          eyebrow="The kitchen's a little smoky"
          telugu="ఏదో పొరపాటు జరిగింది"
          title={
            <>
              Something Got <span className="text-chilli">Over-Spiced</span>
            </>
          }
          subtitle="An unexpected error crept into the recipe on our end. Give it another stir, or head back home while we cool things down."
          footnote={error.digest ? <>Reference: {error.digest}</> : undefined}
        >
          <button
            type="button"
            onClick={() => unstable_retry()}
            className={`btn-primary ${actionBase}`}
          >
            Try Again <span>↻</span>
          </button>
          <a href="/" className={`btn-outline ${actionBase}`}>
            Back Home
          </a>
        </ErrorScreen>
      </body>
    </html>
  );
}
