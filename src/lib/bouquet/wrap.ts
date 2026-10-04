export const PAPERS = {
  blush: { label: "Blush tissue", paper: "#f3cdd3", shade: "#e4aeb8" },
  kraft: { label: "Kraft", paper: "#cfa77d", shade: "#b38a60" },
  white: { label: "White tissue", paper: "#f6f2ee", shade: "#e2d9d1" },
  sage: { label: "Sage", paper: "#c4d1bc", shade: "#a6b89c" },
  noir: { label: "Noir", paper: "#2b2226", shade: "#1b1517" },
} as const;

export const RIBBONS = {
  wine: { label: "Wine satin", ribbon: "#8d1d3f", shade: "#64122b" },
  rose: { label: "Rose satin", ribbon: "#e07a96", shade: "#c35a78" },
  ivory: { label: "Ivory", ribbon: "#f7efe4", shade: "#ddd0bf" },
  sage: { label: "Sage", ribbon: "#7c9572", shade: "#5e7756" },
  black: { label: "Black velvet", ribbon: "#231c1f", shade: "#0f0b0c" },
} as const;

export type PaperId = keyof typeof PAPERS;
export type RibbonId = keyof typeof RIBBONS;

export const PAPER_IDS = Object.keys(PAPERS) as [PaperId, ...PaperId[]];
export const RIBBON_IDS = Object.keys(RIBBONS) as [RibbonId, ...RibbonId[]];

export const CARD_FONTS = {
  caveat: { label: "Caveat", cssVar: "var(--font-caveat)" },
  dancing: { label: "Dancing Script", cssVar: "var(--font-dancing)" },
} as const;

export type CardFontId = keyof typeof CARD_FONTS;
export const CARD_FONT_IDS = Object.keys(CARD_FONTS) as [CardFontId, ...CardFontId[]];

export const STYLE_IDS = ["romantic", "garden", "ink"] as const;
export type StyleId = (typeof STYLE_IDS)[number];

/** Stem and leaf greens per style. Mirrors the .bq[data-style] rules in globals.css. */
export const STYLE_GREENS: Record<StyleId, { leaf: string; leafDark: string; stem: string }> = {
  romantic: { leaf: "#7f9c74", leafDark: "#5d7a57", stem: "#6c8a5c" },
  garden: { leaf: "#6f9160", leafDark: "#4f6f45", stem: "#5f7d4f" },
  ink: { leaf: "#7f9c74", leafDark: "#5d7a57", stem: "#6c8a5c" },
};
