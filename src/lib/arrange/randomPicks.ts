import { CATALOG, FLOWERS } from "@/lib/flowers/catalog";
import type { Pick } from "./arrange";
import { pickOne, prng } from "./prng";

const BLOOMS = FLOWERS.filter((f) => f.category !== "filler");
const FILLERS = FLOWERS.filter((f) => f.category === "filler");

/**
 * A plausible set of picks, the way a person might choose them: a few kinds,
 * some repeated, sometimes a filler. For the review page and tests.
 */
export function randomPicks(seed: number, count?: number): Pick[] {
  const rng = prng(seed);
  const n = count ?? 6 + Math.floor(rng() * 5);
  const kinds = Array.from({ length: 2 + Math.floor(rng() * 3) }, () => pickOne(rng, BLOOMS));
  const picks: Pick[] = [];
  for (let i = 0; i < n; i++) {
    const def = rng() < 0.12 ? pickOne(rng, FILLERS) : pickOne(rng, kinds);
    picks.push({ type: def.id, color: pickOne(rng, Object.keys(CATALOG[def.id].colors)) });
  }
  return picks;
}
