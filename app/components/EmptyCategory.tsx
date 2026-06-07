import Link from "next/link";

export function EmptyCategory({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-chilli/10 text-5xl">
        🫙
      </div>
      <h2 className="font-display mt-6 text-2xl font-bold text-maroon">
        No {label} just yet
      </h2>
      <p className="mt-3 text-sm text-charcoal/70">
        We couldn&apos;t load any {label} from the store. Once products are
        published under the <code>{label}</code> category in Storekit,
        they&apos;ll appear here automatically.
      </p>
      <Link
        href="/"
        className="btn-primary mt-6 inline-flex rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wider"
      >
        Back home
      </Link>
    </div>
  );
}
