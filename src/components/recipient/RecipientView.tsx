"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { RevealSequence } from "@/components/reveal/RevealSequence";
import { markOpenedAction } from "@/lib/actions";
import type { BouquetInput } from "@/lib/bouquet/schema";
import { hasSeen, markSeen, sentFromHere } from "@/lib/local";

const noop = () => () => {};

export function RecipientView({ id, bouquet }: { id: string; bouquet: BouquetInput }) {
  // Seen before in this browser? Then a short replay instead of the envelope.
  // Read only in the browser; the server renders the full, sealed version.
  const seen = useSyncExternalStore(noop, () => hasSeen(id), () => false);
  const { card } = bouquet;

  return (
    <main data-bouquet={id}>
      <RevealSequence
        key={seen ? "quick" : "full"}
        bouquet={bouquet}
        quick={seen}
        onOpen={() => {
          // The sender opening their own link doesn't count as "opened".
          if (!sentFromHere(id)) void markOpenedAction(id);
        }}
        onDone={() => markSeen(id)}
        actions={
          <Link
            href={`/create?to=${encodeURIComponent(card.from)}`}
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-semibold text-accent-ink shadow-[0_8px_20px_-8px_rgb(150_30_70/0.5)] transition-transform active:scale-[0.97]"
          >
            Send {card.from} one back 🌷
          </Link>
        }
      />
    </main>
  );
}
