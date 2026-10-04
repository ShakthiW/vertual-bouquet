"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteBouquetAction } from "@/lib/actions";

/** Two taps to delete, without a browser dialog: deleting can't be undone. */
export function DeleteBouquet({ token, to }: { token: string; to: string }) {
  const [stage, setStage] = useState<"idle" | "confirm" | "done" | "error">("idle");
  const [pending, start] = useTransition();

  if (stage === "done") {
    return (
      <p role="status" className="text-[0.95rem]">
        Deleted. The link won&apos;t open any more.{" "}
        <Link href="/create" className="font-medium text-accent underline underline-offset-4">
          Make a new bouquet
        </Link>
      </p>
    );
  }

  if (stage === "confirm" || stage === "error") {
    return (
      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Confirm delete">
        <span className="text-[0.95rem]">{stage === "error" ? "That didn't work. Try again?" : `Delete it? ${to} won't be able to open it.`}</span>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await deleteBouquetAction(token);
              setStage(r.ok ? "done" : "error");
            })
          }
          className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-semibold text-accent-ink disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button type="button" onClick={() => setStage("idle")} className="text-sm text-ink-soft underline-offset-4 hover:underline">
          Keep it
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setStage("confirm")}
      className="text-sm font-medium text-accent underline-offset-4 hover:underline"
    >
      Delete bouquet
    </button>
  );
}
