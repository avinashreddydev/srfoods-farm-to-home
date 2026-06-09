import type { Metadata } from "next";
import Link from "next/link";
import { ErrorScreen } from "./components/ErrorScreen";

export const metadata: Metadata = {
  title: "Page Not Found — SR Foods",
  description:
    "We couldn't find that page, but our Andhra pickles and karam are right where you left them.",
};

const linkBase =
  "inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider";

export default function NotFound() {
  return (
    <ErrorScreen
      code={<>4🌶️4</>}
      eyebrow="Lost in the spice rack"
      telugu="ఈ పేజీ దొరకలేదు"
      title={
        <>
          This Page Has Gone <span className="text-chilli">Missing</span>
        </>
      }
      subtitle="The page you're looking for slipped out of the pantry. Don't worry — our slow-cured pickles and stone-ground karam are still on the shelf."
    >
      <Link href="/" className={`btn-primary ${linkBase}`}>
        Back Home <span>→</span>
      </Link>
      <Link href="/category/pickles" className={`btn-outline ${linkBase}`}>
        Shop Pickles
      </Link>
      <Link href="/category/karam" className={`btn-outline ${linkBase}`}>
        Shop Karam
      </Link>
    </ErrorScreen>
  );
}
