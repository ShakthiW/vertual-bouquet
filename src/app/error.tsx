"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl" aria-hidden>
        🌧️
      </p>
      <h1 className="font-display text-3xl tracking-tight">Something went wrong</h1>
      <p className="max-w-sm text-ink-soft">
        It&apos;s not you. If you were making a bouquet, your draft is saved on this device.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-accent-ink">
          Try again
        </button>
        <Link href="/" className="inline-flex min-h-12 items-center rounded-full px-5 font-medium text-ink-soft hover:text-ink">
          Home
        </Link>
      </div>
    </main>
  );
}
