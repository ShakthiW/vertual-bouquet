import { describe, expect, it } from "vitest";
import { FlowerPlacementSchema } from "@/lib/bouquet/schema";
import { FRAME, HEAD_SCALE, LIMITS } from "@/lib/bouquet/limits";
import { CATALOG, type FlowerId } from "@/lib/flowers/catalog";
import { arrange, withGreenery, type Pick } from "./arrange";
import { randomPicks } from "./randomPicks";

const SEEDS = Array.from({ length: 60 }, (_, i) => i + 1);

const headRadius = (type: FlowerId, scale: number) => 88 * HEAD_SCALE * CATALOG[type].baseSize * scale;

describe("arrange", () => {
  it("is deterministic for a seed", () => {
    const picks = randomPicks(7);
    expect(arrange(picks, { seed: 42 })).toEqual(arrange(picks, { seed: 42 }));
  });

  it("gives a different arrangement for a different seed (Shuffle)", () => {
    const picks = randomPicks(7);
    expect(arrange(picks, { seed: 1 })).not.toEqual(arrange(picks, { seed: 2 }));
  });

  it("keeps every pick, with its type and colour, and adds no more than the stem limit", () => {
    for (const seed of SEEDS) {
      const picks = randomPicks(seed);
      const out = arrange(picks, { seed });
      expect(out.length).toBeGreaterThanOrEqual(picks.length);
      expect(out.length).toBeLessThanOrEqual(LIMITS.maxStems);
      const key = (p: { type: string; color: string }) => `${p.type}/${p.color}`;
      const remaining = out.map(key);
      for (const p of picks) {
        const at = remaining.indexOf(key(p));
        expect(at, `seed ${seed} lost ${key(p)}`).toBeGreaterThanOrEqual(0);
        remaining.splice(at, 1);
      }
    }
  });

  it("produces placements the save schema accepts", () => {
    for (const seed of SEEDS) {
      for (const f of arrange(randomPicks(seed), { seed })) {
        expect(FlowerPlacementSchema.safeParse(f).success, `seed ${seed}: ${JSON.stringify(f)}`).toBe(true);
      }
    }
  });

  it.each([1, 2, 3, 5, 8, 10, 14])("handles %i picks", (n) => {
    for (const seed of SEEDS.slice(0, 20)) {
      const out = arrange(randomPicks(seed, n), { seed });
      expect(out.length).toBeGreaterThanOrEqual(Math.min(n, LIMITS.maxStems));
    }
  });

  it("returns nothing for no picks", () => {
    expect(arrange([], { seed: 1 })).toEqual([]);
  });

  it("keeps heads inside the frame and above the wrap", () => {
    for (const seed of SEEDS) {
      for (const f of arrange(randomPicks(seed), { seed })) {
        const r = headRadius(f.type, f.scale);
        const x = f.x * FRAME.width;
        const y = f.y * FRAME.height;
        expect(x - r * 0.8, `seed ${seed} ${f.type} off left`).toBeGreaterThan(0);
        expect(x + r * 0.8, `seed ${seed} ${f.type} off right`).toBeLessThan(FRAME.width);
        expect(y - r * 0.6, `seed ${seed} ${f.type} off top`).toBeGreaterThan(0);
        expect(y, `seed ${seed} ${f.type} sunk into the wrap`).toBeLessThan(700);
      }
    }
  });

  it("never stacks two blooms on top of each other", () => {
    for (const seed of SEEDS) {
      const out = arrange(randomPicks(seed), { seed }).filter((f) => CATALOG[f.type].category !== "filler");
      for (let i = 0; i < out.length; i++)
        for (let j = i + 1; j < out.length; j++) {
          const a = out[i];
          const b = out[j];
          const d = Math.hypot((a.x - b.x) * FRAME.width, (a.y - b.y) * FRAME.height);
          const min = (headRadius(a.type, a.scale) + headRadius(b.type, b.scale)) * 0.45;
          expect(d, `seed ${seed}: ${a.type} on top of ${b.type}`).toBeGreaterThan(min);
        }
    }
  });

  it("keeps the bouquet balanced left to right", () => {
    for (const seed of SEEDS) {
      const out = arrange(randomPicks(seed), { seed });
      let mass = 0;
      let mx = 0;
      for (const f of out) {
        const m = headRadius(f.type, f.scale) * (CATALOG[f.type].category === "filler" ? 0.4 : 1);
        mass += m;
        mx += f.x * FRAME.width * m;
      }
      expect(Math.abs(mx / mass - FRAME.width / 2), `seed ${seed}`).toBeLessThan(90);
    }
  });

  it("keeps greenery out of the heart of the bouquet", () => {
    for (const seed of SEEDS) {
      const out = arrange(randomPicks(seed), { seed });
      const blooms = out.filter((f) => CATALOG[f.type].category !== "filler");
      if (blooms.length < 3) continue;
      // A bouquet is wider than it is tall, so measure in its own ellipse.
      const cx = blooms.reduce((s, f) => s + f.x, 0) / blooms.length;
      const cy = blooms.reduce((s, f) => s + f.y, 0) / blooms.length;
      const sx = Math.max(...blooms.map((f) => Math.abs(f.x - cx))) || 1;
      const sy = Math.max(...blooms.map((f) => Math.abs(f.y - cy))) || 1;
      for (const f of out) {
        if (CATALOG[f.type].category !== "filler") continue;
        const e = Math.hypot((f.x - cx) / sx, (f.y - cy) / sy);
        expect(e, `seed ${seed}: ${f.type} in the heart`).toBeGreaterThan(0.6);
      }
    }
  });

  it("puts the focal bloom nearer the centre than the greenery", () => {
    const picks: Pick[] = [
      { type: "peony", color: "blush" },
      { type: "daisy", color: "white" },
      { type: "daisy", color: "white" },
      { type: "tulip", color: "pink" },
      { type: "tulip", color: "pink" },
    ];
    for (const seed of SEEDS.slice(0, 20)) {
      const out = arrange(picks, { seed });
      const dist = (f: (typeof out)[number]) => Math.abs(f.x - 0.5);
      const peony = out.find((f) => f.type === "peony")!;
      const fillers = out.filter((f) => CATALOG[f.type].category === "filler");
      for (const g of fillers) expect(dist(peony)).toBeLessThan(dist(g));
    }
  });

  it("sends lavender to the rim, except when there is nothing else to frame", () => {
    for (const seed of SEEDS.slice(0, 20)) {
      const alone = arrange([{ type: "lavender", color: "lavender" }], { seed, greenery: false });
      expect(Math.abs(alone[0].x - 0.5), `seed ${seed}`).toBeLessThan(0.12);

      const framed = arrange(
        [
          { type: "lavender", color: "lavender" },
          { type: "peony", color: "blush" },
          { type: "rose", color: "red" },
          { type: "rose", color: "blush" },
        ],
        { seed, greenery: false },
      );
      const lavender = framed.find((f) => f.type === "lavender")!;
      const peony = framed.find((f) => f.type === "peony")!;
      expect(Math.abs(lavender.x - 0.5), `seed ${seed}`).toBeGreaterThan(Math.abs(peony.x - 0.5));
      expect(lavender.z, `seed ${seed}: lavender should sit behind`).toBeLessThan(peony.z);
    }
  });

  it("gives a bouquet with no focal flower a focal point", () => {
    const picks: Pick[] = [
      ...Array.from({ length: 6 }, () => ({ type: "lavender" as const, color: "lavender" })),
      { type: "tulip", color: "pink" },
    ];
    for (const seed of SEEDS.slice(0, 20)) {
      const tulip = arrange(picks, { seed }).find((f) => f.type === "tulip")!;
      expect(Math.abs(tulip.x - 0.5), `seed ${seed}`).toBeLessThan(0.15);
    }
  });
});

describe("withGreenery", () => {
  it("adds greenery when none was picked, and respects the stem limit", () => {
    const six = Array.from({ length: 6 }, () => ({ type: "rose" as const, color: "red" }));
    expect(withGreenery(six).length).toBe(9);
    const full = Array.from({ length: LIMITS.maxStems }, () => ({ type: "rose" as const, color: "red" }));
    expect(withGreenery(full).length).toBe(LIMITS.maxStems);
  });

  it("leaves bouquets that already have greenery alone", () => {
    const picks: Pick[] = [
      { type: "rose", color: "red" },
      { type: "eucalyptus", color: "silver" },
      { type: "babys-breath", color: "white" },
    ];
    expect(withGreenery(picks)).toEqual(picks);
  });

  it("never depends on the seed, so Shuffle only moves flowers", () => {
    const picks = randomPicks(3);
    const kinds = (seed: number) => arrange(picks, { seed }).map((f) => `${f.type}/${f.color}`).sort();
    for (const seed of SEEDS.slice(0, 10)) expect(kinds(seed)).toEqual(kinds(1));
  });

  it("can be turned off", () => {
    const picks: Pick[] = [{ type: "rose", color: "red" }];
    expect(arrange(picks, { seed: 1, greenery: false })).toHaveLength(1);
  });
});
