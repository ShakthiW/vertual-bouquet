import type { BouquetVisual, FlowerPlacement } from "./schema";

// Hand-placed bouquets for the playground and landing page, until the
// arrangement engine (Phase 2) produces these automatically.

type P = Omit<FlowerPlacement, "variant" | "rotation" | "scale" | "z"> &
  Partial<Pick<FlowerPlacement, "variant" | "rotation" | "scale" | "z">>;

const place = (flowers: P[]): FlowerPlacement[] =>
  flowers.map((f, i) => ({ variant: 0, rotation: 0, scale: 1, z: i, ...f }));

export const ROMANTIC: BouquetVisual = {
  style: "romantic",
  wrap: { paper: "blush", ribbon: "wine" },
  flowers: place([
    { type: "eucalyptus", color: "silver", x: 0.19, y: 0.33, rotation: -34, scale: 1.05, z: 0 },
    { type: "eucalyptus", color: "silver", x: 0.81, y: 0.31, rotation: 30, scale: 1.05, variant: 1, z: 0 },
    { type: "babys-breath", color: "white", x: 0.29, y: 0.19, rotation: -16, z: 1 },
    { type: "babys-breath", color: "white", x: 0.71, y: 0.18, rotation: 14, variant: 1, z: 1 },
    { type: "rose", color: "red", x: 0.42, y: 0.22, rotation: -10, scale: 0.92, z: 2 },
    { type: "ranunculus", color: "peach", x: 0.61, y: 0.25, rotation: 8, z: 2 },
    { type: "ranunculus", color: "pink", x: 0.26, y: 0.4, rotation: -6, scale: 0.95, variant: 1, z: 3 },
    { type: "rose", color: "blush", x: 0.72, y: 0.4, rotation: 12, scale: 0.95, variant: 1, z: 3 },
    { type: "peony", color: "blush", x: 0.47, y: 0.37, z: 4 },
    { type: "rose", color: "red", x: 0.37, y: 0.52, rotation: 4, scale: 0.9, variant: 2, z: 5 },
    { type: "rose", color: "white", x: 0.6, y: 0.53, rotation: -6, scale: 0.88, z: 5 },
  ]),
};

export const GARDEN: BouquetVisual = {
  style: "garden",
  wrap: { paper: "kraft", ribbon: "sage" },
  flowers: place([
    { type: "lavender", color: "lavender", x: 0.21, y: 0.24, rotation: -24, scale: 1.05, z: 0 },
    { type: "lavender", color: "lavender", x: 0.79, y: 0.22, rotation: 22, scale: 1.05, variant: 1, z: 0 },
    { type: "eucalyptus", color: "sage", x: 0.83, y: 0.42, rotation: 36, z: 0 },
    { type: "tulip", color: "yellow", x: 0.37, y: 0.17, rotation: -12, z: 1 },
    { type: "iris", color: "violet", x: 0.6, y: 0.18, rotation: 10, z: 1 },
    { type: "daisy", color: "white", x: 0.24, y: 0.4, rotation: -10, z: 2 },
    { type: "daisy", color: "white", x: 0.72, y: 0.38, rotation: 14, variant: 1, z: 2 },
    { type: "sunflower", color: "golden", x: 0.48, y: 0.34, z: 3 },
    { type: "forget-me-not", color: "blue", x: 0.34, y: 0.52, z: 4 },
    { type: "tulip", color: "red", x: 0.61, y: 0.52, rotation: 8, scale: 0.9, variant: 1, z: 4 },
  ]),
};

export const INK: BouquetVisual = {
  style: "ink",
  wrap: { paper: "white", ribbon: "black" },
  flowers: place([
    { type: "eucalyptus", color: "silver", x: 0.2, y: 0.32, rotation: -32, scale: 1.05, z: 0 },
    { type: "babys-breath", color: "white", x: 0.74, y: 0.2, rotation: 14, z: 0 },
    { type: "lily", color: "white", x: 0.36, y: 0.2, rotation: -14, scale: 0.85, z: 1 },
    { type: "orchid", color: "white", x: 0.66, y: 0.36, rotation: 10, scale: 0.95, z: 2 },
    { type: "camellia", color: "white", x: 0.44, y: 0.39, z: 3 },
    { type: "rose", color: "white", x: 0.28, y: 0.5, rotation: -8, scale: 0.9, z: 4 },
    { type: "ranunculus", color: "white", x: 0.58, y: 0.54, rotation: 6, scale: 0.9, z: 5 },
  ]),
};

export const SAMPLES = { romantic: ROMANTIC, garden: GARDEN, ink: INK };
