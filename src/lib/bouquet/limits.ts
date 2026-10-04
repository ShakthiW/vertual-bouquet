export const LIMITS = {
  /** Flowers the sender picks (focal + secondary). */
  minFlowers: 1,
  maxFlowers: 10,
  /** Picked flowers plus fillers. */
  maxStems: 14,
  nameLength: 40,
  messageLength: 500,
} as const;

/** The bouquet frame. Every placement is normalized against this. */
export const FRAME = {
  width: 1000,
  height: 1200,
  /** Where every stem meets: under the ribbon. */
  bindX: 500,
  bindY: 930,
} as const;

/** Frame units per flower-art unit, for a flower with baseSize 1 and scale 1. */
export const HEAD_SCALE = 1.12;
