import { z } from "zod";
import { CATALOG, FLOWER_IDS } from "@/lib/flowers/catalog";
import { LIMITS } from "./limits";
import { CARD_FONT_IDS, PAPER_IDS, RIBBON_IDS, STYLE_IDS } from "./wrap";

export const FlowerPlacementSchema = z
  .object({
    type: z.enum(FLOWER_IDS),
    variant: z.number().int().min(0).max(2),
    color: z.string().max(24),
    /** Flower head position, normalized 0..1 inside the bouquet frame. */
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    rotation: z.number().min(-45).max(45),
    scale: z.number().min(0.5).max(1.6),
    z: z.number().int().min(0).max(99),
  })
  .refine((f) => f.color in CATALOG[f.type].colors, {
    message: "Unknown colour for this flower",
    path: ["color"],
  })
  .refine((f) => f.variant < CATALOG[f.type].variants, {
    message: "Unknown variant for this flower",
    path: ["variant"],
  });

const name = z.string().trim().min(1).max(LIMITS.nameLength);

export const BouquetInputSchema = z.object({
  style: z.enum(STYLE_IDS),
  flowers: z.array(FlowerPlacementSchema).min(LIMITS.minFlowers).max(LIMITS.maxStems),
  wrap: z.object({
    paper: z.enum(PAPER_IDS),
    ribbon: z.enum(RIBBON_IDS),
  }),
  card: z.object({
    to: name,
    message: z.string().trim().max(LIMITS.messageLength),
    from: name,
    font: z.enum(CARD_FONT_IDS),
  }),
});

export type FlowerPlacement = z.infer<typeof FlowerPlacementSchema>;
export type BouquetInput = z.infer<typeof BouquetInputSchema>;

export type BouquetRecord = BouquetInput & {
  id: string;
  createdAt: string;
  openedAt?: string;
};

/** What the renderer needs. A draft in the Studio has no card yet. */
export type BouquetVisual = Pick<BouquetInput, "style" | "flowers" | "wrap">;
