import { FRAME, HEAD_SCALE } from "@/lib/bouquet/limits";
import type { FlowerPlacement } from "@/lib/bouquet/schema";
import { CATALOG } from "@/lib/flowers/catalog";

const round = (n: number) => Math.round(n * 10) / 10;

/** The leaf drawn on each stem, pointing along +x from (0,0). */
export const LEAF = "M0 0 C14 -12 36 -12 56 0 C36 9 14 9 0 0Z";

export function headOf(f: FlowerPlacement) {
  return {
    x: f.x * FRAME.width,
    y: f.y * FRAME.height,
    s: HEAD_SCALE * CATALOG[f.type].baseSize * f.scale,
  };
}

/**
 * A stem leaves the binding point heading toward its flower, bowing slightly
 * outward, and continues below the binding point the other way, the way the
 * stems of a hand-tied bouquet cross under the ribbon.
 */
export function stemOf(f: FlowerPlacement) {
  const { x: hx, y: hy } = headOf(f);
  const bx = FRAME.bindX;
  const by = FRAME.bindY;
  const dx = hx - bx;
  const dy = hy - by;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  // Control point: 45% along, pushed outward perpendicular to the stem.
  const bow = Math.min(40, len * 0.08) * Math.sign(dx || 1);
  const cx = bx + dx * 0.45 - uy * bow;
  const cy = by + dy * 0.45 + ux * bow;

  // Below the binding: continue in the opposite direction until past the wrap.
  const below = Math.min(300, 250 / Math.max(0.35, -uy));
  const ex = bx - ux * below;
  const ey = by - uy * below;

  // Leaf at t = 0.55 on the quadratic, angled along the stem.
  const t = 0.55;
  const lx = (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * cx + t * t * hx;
  const ly = (1 - t) * (1 - t) * by + 2 * (1 - t) * t * cy + t * t * hy;
  const tx = 2 * (1 - t) * (cx - bx) + 2 * t * (hx - cx);
  const ty = 2 * (1 - t) * (cy - by) + 2 * t * (hy - cy);
  const leafAngle = (Math.atan2(ty, tx) * 180) / Math.PI;

  return {
    above: `M${round(bx)} ${round(by)} Q${round(cx)} ${round(cy)} ${round(hx)} ${round(hy)}`,
    below: `M${round(bx)} ${round(by)} L${round(ex)} ${round(ey)}`,
    leaf: { x: round(lx), y: round(ly), angle: round(leafAngle) },
  };
}

/**
 * How big the wrap should be for these flowers: paper sized to the blooms, so
 * a small bouquet of forget-me-nots is not swallowed by a florist-size cone.
 * 1 = the wrap as drawn. Greenery and spikes may stick out past it, as in life.
 */
export function wrapScaleOf(flowers: FlowerPlacement[]) {
  let spread = 0;
  for (const f of flowers) {
    const def = CATALOG[f.type];
    if (def.category === "filler" || def.spike) continue;
    const { x, s } = headOf(f);
    spread = Math.max(spread, Math.abs(x - FRAME.bindX) + 88 * s * 0.8);
  }
  if (spread === 0) return 0.8;
  return Math.min(1.06, Math.max(0.72, spread / 330));
}
