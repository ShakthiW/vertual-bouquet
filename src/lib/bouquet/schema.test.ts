import { describe, expect, it } from "vitest";
import { SAMPLES } from "./samples";
import { BouquetInputSchema, FlowerPlacementSchema } from "./schema";

const card = { to: "Maya", message: "Hope this makes your day a little brighter.", from: "Shakthi", font: "caveat" };

describe("BouquetInputSchema", () => {
  it.each(Object.entries(SAMPLES))("accepts the %s sample", (_, sample) => {
    expect(BouquetInputSchema.safeParse({ ...sample, card }).success).toBe(true);
  });

  it("rejects a colour the flower does not come in", () => {
    const r = FlowerPlacementSchema.safeParse({ type: "sunflower", color: "blush", variant: 0, x: 0.5, y: 0.5, rotation: 0, scale: 1, z: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects a variant the flower does not have", () => {
    const r = FlowerPlacementSchema.safeParse({ type: "lavender", color: "lavender", variant: 2, x: 0.5, y: 0.5, rotation: 0, scale: 1, z: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects positions outside the frame and unknown flowers", () => {
    const base = { type: "rose", color: "red", variant: 0, x: 0.5, y: 0.5, rotation: 0, scale: 1, z: 0 };
    expect(FlowerPlacementSchema.safeParse({ ...base, x: 1.2 }).success).toBe(false);
    expect(FlowerPlacementSchema.safeParse({ ...base, type: "cactus" }).success).toBe(false);
  });

  it("trims names and rejects empty or oversized cards", () => {
    const s = SAMPLES.romantic;
    const ok = BouquetInputSchema.parse({ ...s, card: { ...card, to: "  Maya  " } });
    expect(ok.card.to).toBe("Maya");
    expect(BouquetInputSchema.safeParse({ ...s, card: { ...card, to: "   " } }).success).toBe(false);
    expect(BouquetInputSchema.safeParse({ ...s, card: { ...card, message: "x".repeat(501) } }).success).toBe(false);
  });

  it("rejects too many stems", () => {
    const s = SAMPLES.romantic;
    const flowers = Array.from({ length: 15 }, () => s.flowers[0]);
    expect(BouquetInputSchema.safeParse({ ...s, flowers, card }).success).toBe(false);
  });
});
