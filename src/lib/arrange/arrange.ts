// The arrangement engine: picked flowers in, a good-looking bouquet out.
//
//   arrange(picks, { seed }) -> FlowerPlacement[]
//
// Pure and deterministic: the same picks and seed always give the same
// bouquet, which is what makes "Shuffle" (= a new seed) and server rendering
// work. All geometry is in bouquet-frame units (1000 x 1200), converted to the
// normalized placements the schema stores at the very end.
//
// How it works:
//   1. Classify. Focal blooms go low and slightly off-centre, secondary blooms
//      in a ring around them, fillers on the outer edge of the dome.
//   2. Place greedily, biggest first. Each flower samples candidate spots in
//      its zone and keeps the one that costs least against what is already
//      placed (overlap, distance from its zone, staying in frame).
//   3. Repeat the whole thing with different sub-seeds and keep the attempt
//      with the best global score (overlap, holes, balance, clumping).
//   4. Finish: lean each stem outward, small scale/rotation jitter so it looks
//      hand-made, and z-order back to front.

import { FRAME, HEAD_SCALE, LIMITS } from "@/lib/bouquet/limits";
import type { FlowerPlacement } from "@/lib/bouquet/schema";
import { CATALOG, defaultColor, type FlowerCategory, type FlowerId } from "@/lib/flowers/catalog";
import { gauss, prng, range, type Rng } from "./prng";

export type Pick = { type: FlowerId; color: string; variant?: number };

export type ArrangeOptions = {
  seed: number;
  /** Add a little greenery when the sender picked none. Default true. */
  greenery?: boolean;
  /** Whole-bouquet attempts to choose between. Default 12. */
  attempts?: number;
};

// --- tuning ------------------------------------------------------------------
// Art is drawn in a -100..100 box; most of a head's visual mass sits inside 88.
const ART_RADIUS = 88;
// The dome the heads fill, at scale 1. It sits on the wrap opening and grows
// upward, so a small bouquet nestles into the paper instead of floating.
const DOME = { cx: 500, bottom: 650, ax: 300, ay: 205 };
const centreY = (s: number) => DOME.bottom - DOME.ay * s * 0.95;
// Heads lower than this sink into the wrap.
const MAX_HEAD_Y = 650;
const CANDIDATES = 28;

type Body = {
  pick: Pick;
  category: FlowerCategory;
  /** Where it is placed, which can differ from its category (see assignZones). */
  zone: FlowerCategory;
  /** Its index among bodies in the same zone, for alternating sides. */
  slot: number;
  /** Its flower makes up much of the bouquet, so it is allowed to touch itself. */
  common: boolean;
  r: number;
  x: number;
  y: number;
  scale: number;
};

const radiusOf = (type: FlowerId, scale: number) =>
  ART_RADIUS * HEAD_SCALE * CATALOG[type].baseSize * scale;

// Overlap allowance: blooms may tuck behind each other a little; airy fillers a lot.
const contact = (a: Body, b: Body) =>
  (a.r + b.r) * (a.category === "filler" || b.category === "filler" ? 0.42 : 0.74);

// --- greenery -------------------------------------------------------------------

/**
 * Greenery depends only on the picks, never on the seed, so Shuffle moves
 * flowers around without swapping which ones are in the bouquet.
 */
export function withGreenery(picks: Pick[]): Pick[] {
  const fillers = picks.filter((p) => CATALOG[p.type].category === "filler").length;
  const room = LIMITS.maxStems - picks.length;
  if (fillers >= 2 || room <= 0 || picks.length === 0) return picks;
  // Small blooms need more greenery to read as a full bouquet.
  const meanSize = picks.reduce((sum, p) => sum + CATALOG[p.type].baseSize, 0) / picks.length;
  const target = picks.length >= 5 || meanSize < 0.9 ? 3 : 2;
  const want = Math.min(room, target - fillers);
  const pool: FlowerId[] = ["eucalyptus", "babys-breath"];
  const extra = Array.from({ length: want }, (_, i): Pick => {
    const type = pool[i % 2];
    return { type, color: defaultColor(type) };
  });
  return [...picks, ...extra];
}

// --- zones ----------------------------------------------------------------------

// Only the first two focal blooms take the centre; more than that and they
// stack, so the rest join the ring like secondary blooms.
const MAX_CENTRE_FOCALS = 2;

const rankOf = (b: Pick) => {
  const c = CATALOG[b.type].category;
  return c === "focal" ? 0 : c === "secondary" ? 1 : 2;
};

/**
 * Decide each body's zone once, knowing the whole bouquet, and sort biggest
 * first within rank (the placement order). Spikes go to the rim with the
 * greenery, unless there is nothing else to frame.
 */
function assignZones(bodies: Body[]): Body[] {
  const blooms = bodies.filter((b) => b.category !== "filler" && !CATALOG[b.pick.type].spike).length;
  // Spikes frame the blooms, but only a few of them: a mostly-lavender
  // bouquet is a lavender bunch, not an empty middle ringed by spikes.
  let rimSpikes = blooms === 0 ? 0 : Math.max(2, blooms - 1);
  const counts = new Map<FlowerId, number>();
  for (const b of bodies) counts.set(b.pick.type, (counts.get(b.pick.type) ?? 0) + 1);
  for (const b of bodies) b.common = (counts.get(b.pick.type) ?? 0) / bodies.length > 0.4;
  const sorted = [...bodies].sort((a, b) => rankOf(a.pick) - rankOf(b.pick) || b.r - a.r);
  // Every bouquet needs a focal point: with no focal flowers picked, the
  // biggest non-spike bloom takes the centre.
  if (!sorted.some((b) => b.category === "focal")) {
    const star = sorted.find((b) => b.category === "secondary" && !CATALOG[b.pick.type].spike);
    if (star) star.category = "focal";
  }
  const focals = { n: 0 };
  const slots: Record<FlowerCategory, number> = { focal: 0, secondary: 0, filler: 0 };
  for (const b of sorted) {
    let zone = b.category;
    if (CATALOG[b.pick.type].spike && rimSpikes > 0) {
      zone = "filler";
      rimSpikes--;
    }
    else if (zone === "focal" && focals.n++ >= MAX_CENTRE_FOCALS) zone = "secondary";
    b.zone = zone;
    b.slot = slots[zone]++;
  }
  return sorted;
}

function candidate(b: Body, s: number, rng: Rng, sideBias: number) {
  const { cx, ax, ay } = DOME;
  const cy = centreY(s);
  const { zone, slot } = b;
  if (zone === "focal") {
    // Rule of thirds: alternate focal blooms either side of centre, low and forward.
    const side = slot % 2 === 0 ? sideBias : -sideBias;
    return {
      x: cx + side * 55 * s + gauss(rng) * 45 * s,
      y: cy + 25 * s + gauss(rng) * 40 * s,
    };
  }
  if (zone === "secondary") {
    const theta = range(rng, 165, 375) * (Math.PI / 180);
    const rho = range(rng, 0.45, 0.95);
    return { x: cx + Math.cos(theta) * rho * ax * s, y: cy + Math.sin(theta) * rho * ay * s };
  }
  // Fillers: the upper rim, mostly on the shoulders, alternating sides.
  const left = slot % 2 === 0;
  const deg = left ? range(rng, 192, 240) : range(rng, 300, 348);
  const theta = deg * (Math.PI / 180);
  const rho = range(rng, 0.85, 1.12);
  return { x: cx + Math.cos(theta) * rho * ax * s, y: cy + Math.sin(theta) * rho * ay * s };
}

// --- cost -----------------------------------------------------------------------

function boundsCost(b: Body) {
  let c = 0;
  if (b.y > MAX_HEAD_Y) c += ((b.y - MAX_HEAD_Y) / 40) ** 2;
  if (b.y - b.r * 0.6 < 60) c += ((60 - (b.y - b.r * 0.6)) / 40) ** 2;
  const left = b.x - b.r * 0.8;
  const right = b.x + b.r * 0.8;
  if (left < 40) c += ((40 - left) / 40) ** 2;
  if (right > FRAME.width - 40) c += ((right - (FRAME.width - 40)) / 40) ** 2;
  return c;
}

function pairCost(a: Body, b: Body) {
  const d = Math.hypot(a.x - b.x, a.y - b.y);
  const min = contact(a, b);
  let c = 0;
  if (d < min) c += ((min - d) / (a.r + b.r)) ** 2 * 60;
  // The same flower touching itself reads as a clump, not a bouquet; the same
  // flower in the same colour, doubly so.
  if (a.pick.type === b.pick.type && d < (a.r + b.r) * 1.1) {
    // A bouquet that is mostly one flower is supposed to be a bunch of it.
    const weight = a.common ? 0.2 : 1;
    c += (a.pick.color === b.pick.color ? 1.4 : 0.7) * weight;
  }
  return c;
}

function zoneCost(b: Body, s: number) {
  const zone = b.zone;
  const { cx, ax, ay } = DOME;
  const cy = centreY(s);
  const ex = (b.x - cx) / (ax * s);
  const ey = (b.y - cy) / (ay * s);
  const rho = Math.hypot(ex, ey);
  if (zone === "focal") return Math.hypot(b.x - cx, b.y - (cy + 25 * s)) / (90 * s);
  if (zone === "filler") return Math.abs(rho - 1) * 1.5;
  return rho > 1 ? (rho - 1) * 3 : 0;
}

/** Global score for a finished arrangement. Lower is better. Exported for tests. */
export function scoreBodies(bodies: Body[], s: number) {
  let overlap = 0;
  for (let i = 0; i < bodies.length; i++)
    for (let j = i + 1; j < bodies.length; j++) overlap += pairCost(bodies[i], bodies[j]);

  let bounds = 0;
  let zone = 0;
  let mass = 0;
  let mx = 0;
  for (const b of bodies) {
    bounds += boundsCost(b);
    zone += zoneCost(b, s);
    const m = b.category === "filler" ? b.r * 0.4 : b.r;
    mass += m;
    mx += b.x * m;
  }
  const balance = mass ? ((mx / mass - DOME.cx) / 60) ** 2 : 0;

  // Holes: sample the dome's core and penalise points no bloom covers.
  let holes = 0;
  const blooms = bodies.filter((b) => b.category !== "filler");
  if (blooms.length >= 3) {
    const { cx, ax, ay } = DOME;
    const cy = centreY(s);
    for (let gx = -0.6; gx <= 0.61; gx += 0.3)
      for (let gy = -0.6; gy <= 0.61; gy += 0.3) {
        if (gx * gx + gy * gy > 0.45) continue;
        const px = cx + gx * ax * s;
        const py = cy + gy * ay * s;
        const covered = blooms.some((b) => Math.hypot(b.x - px, b.y - py) < b.r * 1.05);
        if (!covered) holes += 1;
      }
  }

  return overlap + bounds * 20 + zone * 0.6 + balance * 4 + holes * 1.2;
}

// --- placement ------------------------------------------------------------------

const bodyOf = (pick: Pick, scale: number, x = 0, y = 0): Body => ({
  pick,
  category: CATALOG[pick.type].category,
  zone: CATALOG[pick.type].category,
  slot: 0,
  common: false,
  scale,
  r: radiusOf(pick.type, scale),
  x,
  y,
});

function attempt(picks: Pick[], s: number, rng: Rng): Body[] {
  const order = assignZones(picks.map((pick) => bodyOf(pick, 1 + gauss(rng) * 0.05)));

  const sideBias = rng() < 0.5 ? 1 : -1;
  const placed: Body[] = [];

  for (const b of order) {
    let best = { x: DOME.cx, y: centreY(s), cost: Infinity };
    for (let k = 0; k < CANDIDATES; k++) {
      const c = candidate(b, s, rng, sideBias);
      const probe = { ...b, x: c.x, y: c.y };
      let cost = zoneCost(probe, s) * 0.6 + boundsCost(probe) * 20;
      for (const p of placed) cost += pairCost(probe, p);
      if (cost < best.cost) best = { ...c, cost };
    }
    b.x = best.x;
    b.y = best.y;
    placed.push(b);
  }
  return placed;
}

/** How big the dome should be for this much flower. */
function domeScale(picks: Pick[]) {
  let area = 0;
  for (const p of picks) {
    const r = radiusOf(p.type, 1);
    area += Math.PI * r * r * (CATALOG[p.type].category === "filler" ? 0.35 : 1);
  }
  return Math.min(1.22, Math.max(0.7, Math.sqrt(area / 240_000)));
}

// --- finish ---------------------------------------------------------------------

const round = (n: number, places = 3) => Math.round(n * 10 ** places) / 10 ** places;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function finish(bodies: Body[], rng: Rng): FlowerPlacement[] {
  // Back to front: fillers first, then higher heads, so lower blooms overlap them.
  const sorted = [...bodies].sort((a, b) => rankZ(a) - rankZ(b) || a.y - b.y);
  return sorted.map((b, z) => {
    const def = CATALOG[b.pick.type];
    const lean = ((b.x - DOME.cx) / DOME.ax) * (b.zone === "filler" ? 34 : 18);
    return {
      type: b.pick.type,
      color: b.pick.color in def.colors ? b.pick.color : defaultColor(b.pick.type),
      variant: b.pick.variant !== undefined && b.pick.variant < def.variants ? b.pick.variant : Math.floor(rng() * def.variants),
      x: round(clamp(b.x / FRAME.width, 0, 1)),
      y: round(clamp(b.y / FRAME.height, 0, 1)),
      rotation: round(clamp(lean + gauss(rng) * 6, -45, 45), 1),
      scale: round(clamp(b.scale, 0.5, 1.6), 2),
      z,
    };
  });
}

// Whatever sits on the rim goes at the back; everything else in front of it.
const rankZ = (b: Body) => (b.zone === "filler" ? 0 : 1);

// --- entry point ------------------------------------------------------------------

export function arrange(input: Pick[], { seed, greenery = true, attempts = 12 }: ArrangeOptions): FlowerPlacement[] {
  const picks = (greenery ? withGreenery(input) : input).slice(0, LIMITS.maxStems);
  if (picks.length === 0) return [];

  const s = domeScale(picks);
  let best: Body[] = [];
  let bestScore = Infinity;
  for (let a = 0; a < attempts; a++) {
    const bodies = attempt(picks, s, prng(seed * 31 + a * 7919 + 1));
    const score = scoreBodies(bodies, s);
    if (score < bestScore) {
      best = bodies;
      bestScore = score;
    }
  }
  return finish(best, prng(seed ^ 0x9e3779b9));
}

/** Score an already-finished arrangement (used by tests and the playground). */
export function scoreArrangement(flowers: FlowerPlacement[]) {
  const bodies = assignZones(
    flowers.map((f) => bodyOf({ type: f.type, color: f.color }, f.scale, f.x * FRAME.width, f.y * FRAME.height)),
  );
  return scoreBodies(bodies, domeScale(bodies.map((b) => b.pick)));
}
