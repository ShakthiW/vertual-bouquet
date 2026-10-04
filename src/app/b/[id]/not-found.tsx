import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl" aria-hidden>
        🥀
      </p>
      <h1 className="font-display text-3xl tracking-tight">This bouquet couldn&apos;t be found</h1>
      <p className="max-w-sm text-ink-soft">
        The link may have a typo, or the person who sent it took it down.
      </p>
      <Link
        href="/create"
        className="mt-2 inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-accent-ink"
      >
        Make a bouquet
      </Link>
    </main>
  );
}
