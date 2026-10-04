"use client";

import { useState } from "react";
import { Bouquet } from "@/components/bouquet/Bouquet";
import { arrange, scoreArrangement } from "@/lib/arrange/arrange";
import { randomPicks } from "@/lib/arrange/randomPicks";
import { PAPER_IDS, RIBBON_IDS } from "@/lib/bouquet/wrap";

const COUNT = 48;

export function ArrangeReview() {
  const [base, setBase] = useState(1);
  const [count, setCount] = useState<number | "mixed">("mixed");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl tracking-tight">Arrangement review</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            Flowers
            <select
              className="rounded border border-hairline bg-surface px-2 py-1"
              value={count}
              onChange={(e) => setCount(e.target.value === "mixed" ? "mixed" : Number(e.target.value))}
            >
              <option value="mixed">6–10 (mixed)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="rounded-full bg-accent px-4 py-1.5 font-medium text-accent-ink"
            onClick={() => setBase((b) => b + COUNT)}
          >
            Next {COUNT} seeds
          </button>
          <span className="text-ink-soft">
            seeds {base}–{base + COUNT - 1}
          </span>
        </div>
      </header>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: COUNT }, (_, i) => {
          const seed = base + i;
          const picks = randomPicks(seed, count === "mixed" ? undefined : count);
          const flowers = arrange(picks, { seed });
          const data = {
            style: "romantic" as const,
            wrap: { paper: PAPER_IDS[seed % PAPER_IDS.length], ribbon: RIBBON_IDS[seed % RIBBON_IDS.length] },
            flowers,
          };
          return (
            <li key={seed} className="rounded-xl bg-[#fbeef0] p-2">
              <Bouquet data={data} animated={false} className="w-full" />
              <p className="mt-1 flex justify-between text-xs text-ink-soft">
                <span>#{seed}</span>
                <span>
                  {flowers.length} stems · {scoreArrangement(flowers).toFixed(1)}
                </span>
              </p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
