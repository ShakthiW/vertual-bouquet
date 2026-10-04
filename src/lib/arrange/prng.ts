/** mulberry32: tiny, fast, deterministic. Same seed, same bouquet, on server and client. */
export function prng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = ReturnType<typeof prng>;

export const range = (rng: Rng, min: number, max: number) => min + (max - min) * rng();

/** Approximately normal, mean 0, standard deviation 1. */
export const gauss = (rng: Rng) => (rng() + rng() + rng() + rng() - 2) * 1.7320508;

export const pickOne = <T,>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];

/** A fresh, well-mixed seed for "Shuffle". */
export const newSeed = () => Math.floor(Math.random() * 2 ** 31);
