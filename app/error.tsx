"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorScreen } from "./components/ErrorScreen";

const linkBase =
  "inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider";

export default function ErrorBoundary({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Surface the error to logs / your reporting service.
    console.error(error);
  }, [error]);

  return (
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
        className={`btn-primary ${linkBase}`}
      >
        Try Again <span>↻</span>
      </button>
      <Link href="/" className={`btn-outline ${linkBase}`}>
        Back Home
      </Link>
    </ErrorScreen>
  );
}
