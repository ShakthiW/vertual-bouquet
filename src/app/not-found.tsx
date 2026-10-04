import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl" aria-hidden>
        🥀
      </p>
      <h1 className="font-display text-3xl tracking-tight">This page doesn&apos;t exist</h1>
      <p className="max-w-sm text-ink-soft">Maybe a petal blew the link away.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/create" className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-accent-ink">
          Make a bouquet
        </Link>
        <Link href="/" className="inline-flex min-h-12 items-center rounded-full px-5 font-medium text-ink-soft hover:text-ink">
          Home
        </Link>
      </div>
    </main>
  );
}
