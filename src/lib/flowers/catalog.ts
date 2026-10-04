export type FlowerCategory = "focal" | "secondary" | "filler";

export type FlowerColor = {
  label: string;
  petal: string;
  shade: string;
  light: string;
  center: string;
  centerDark?: string;
};

export type FlowerDef = {
  id: FlowerId;
  name: string;
  meanings: string[];
  category: FlowerCategory;
  /** Relative head size in the bouquet frame. 1 = a medium rose. */
  baseSize: number;
  /** Tall spikes (lavender) are arranged like greenery: on the rim, at the back. */
  spike?: boolean;
  colors: Record<string, FlowerColor>;
  variants: number;
};

export const FLOWER_IDS = [
  "rose",
  "peony",
  "ranunculus",
  "tulip",
  "lily",
  "camellia",
  "sunflower",
  "daisy",
  "forget-me-not",
  "iris",
  "orchid",
  "lavender",
  "babys-breath",
  "eucalyptus",
] as const;

export type FlowerId = (typeof FLOWER_IDS)[number];

export const CATALOG: Record<FlowerId, FlowerDef> = {
  rose: {
    id: "rose",
    name: "Rose",
    meanings: ["Love", "Appreciation", "Affection"],
    category: "focal",
    baseSize: 1,
    variants: 3,
    colors: {
      red: { label: "Red", petal: "#c42b45", shade: "#8f1530", light: "#e0566b", center: "#7a0f25" },
      blush: { label: "Blush", petal: "#f2b6bf", shade: "#d98593", light: "#fbd6db", center: "#c96b7b" },
      white: { label: "White", petal: "#f7f1ec", shade: "#ddd0c6", light: "#ffffff", center: "#cbbcb0" },
      yellow: { label: "Yellow", petal: "#f6cf5a", shade: "#d9a52c", light: "#fbe28f", center: "#c48a1c" },
    },
  },
  peony: {
    id: "peony",
    name: "Peony",
    meanings: ["A happy life", "Romance", "Good fortune"],
    category: "focal",
    baseSize: 1.25,
    variants: 2,
    colors: {
      blush: { label: "Blush", petal: "#f4c2cc", shade: "#e093a4", light: "#fde0e5", center: "#f0d27a" },
      coral: { label: "Coral", petal: "#f39a8c", shade: "#d9695c", light: "#fbc0b5", center: "#f3d17a" },
      white: { label: "White", petal: "#faf3ef", shade: "#e6d5cc", light: "#ffffff", center: "#f0d27a" },
      magenta: { label: "Magenta", petal: "#d4487c", shade: "#a72a5c", light: "#ea7aa2", center: "#f0d27a" },
    },
  },
  ranunculus: {
    id: "ranunculus",
    name: "Ranunculus",
    meanings: ["You're dazzling", "Charm"],
    category: "secondary",
    baseSize: 0.85,
    variants: 2,
    colors: {
      peach: { label: "Peach", petal: "#f7b98f", shade: "#e08d62", light: "#fcd8bd", center: "#8aa35f" },
      pink: { label: "Pink", petal: "#f19ab3", shade: "#d56a8a", light: "#f9c4d3", center: "#8aa35f" },
      butter: { label: "Butter", petal: "#f7e08f", shade: "#dcbd57", light: "#fcefc0", center: "#8aa35f" },
      white: { label: "White", petal: "#f8f3ee", shade: "#e0d4ca", light: "#ffffff", center: "#8aa35f" },
    },
  },
  tulip: {
    id: "tulip",
    name: "Tulip",
    meanings: ["Perfect love", "Cheerful thoughts"],
    category: "secondary",
    baseSize: 0.9,
    variants: 2,
    colors: {
      red: { label: "Red", petal: "#d8344a", shade: "#a81d33", light: "#ec6474", center: "#6a1220" },
      pink: { label: "Pink", petal: "#f08fb0", shade: "#d06189", light: "#f8bcd0", center: "#8c3155" },
      yellow: { label: "Yellow", petal: "#f7cf4f", shade: "#dca428", light: "#fbe58e", center: "#a3761a" },
      purple: { label: "Purple", petal: "#9a6fc4", shade: "#734a9e", light: "#bf9be0", center: "#4b2d6c" },
    },
  },
  lily: {
    id: "lily",
    name: "Lily",
    meanings: ["Devotion", "Beauty"],
    category: "focal",
    baseSize: 1.2,
    variants: 2,
    colors: {
      white: { label: "White", petal: "#fbf7f1", shade: "#e4d9cc", light: "#ffffff", center: "#c8722e", centerDark: "#8a4a1a" },
      pink: { label: "Stargazer", petal: "#f3a6bf", shade: "#d55f86", light: "#fbd3df", center: "#b8442f", centerDark: "#7e2b1c" },
      orange: { label: "Orange", petal: "#f59a4f", shade: "#d9702a", light: "#fbbf86", center: "#7d3b17", centerDark: "#5a2a10" },
    },
  },
  camellia: {
    id: "camellia",
    name: "Camellia",
    meanings: ["Longing", "Admiration"],
    category: "secondary",
    baseSize: 0.95,
    variants: 2,
    colors: {
      red: { label: "Red", petal: "#cf3448", shade: "#a01f33", light: "#e66476", center: "#f2c84b", centerDark: "#c99a22" },
      pink: { label: "Pink", petal: "#f3a3b6", shade: "#d97690", light: "#f9cbd6", center: "#f2c84b", centerDark: "#c99a22" },
      white: { label: "White", petal: "#faf4ef", shade: "#e3d6cb", light: "#ffffff", center: "#f2c84b", centerDark: "#c99a22" },
    },
  },
  sunflower: {
    id: "sunflower",
    name: "Sunflower",
    meanings: ["Adoration", "Happiness", "Warmth"],
    category: "focal",
    baseSize: 1.15,
    variants: 2,
    colors: {
      golden: { label: "Golden", petal: "#f6c431", shade: "#e09a17", light: "#fbd968", center: "#6b4220", centerDark: "#3f2512" },
      lemon: { label: "Lemon", petal: "#f7dc5a", shade: "#dfb92f", light: "#fbea92", center: "#5f4a22", centerDark: "#3b2c12" },
    },
  },
  daisy: {
    id: "daisy",
    name: "Daisy",
    meanings: ["Cheerfulness", "Innocence", "Loyal love"],
    category: "secondary",
    baseSize: 0.75,
    variants: 3,
    colors: {
      white: { label: "White", petal: "#ffffff", shade: "#e7e2dc", light: "#ffffff", center: "#f2b928", centerDark: "#c88a12" },
      pink: { label: "Pink", petal: "#f9c9d6", shade: "#e7a0b4", light: "#fde4eb", center: "#f2b928", centerDark: "#c88a12" },
    },
  },
  "forget-me-not": {
    id: "forget-me-not",
    name: "Forget-me-not",
    meanings: ["Don't forget me", "True love"],
    category: "secondary",
    baseSize: 0.7,
    variants: 2,
    colors: {
      blue: { label: "Blue", petal: "#7fa8e6", shade: "#5a84c9", light: "#b3cdf3", center: "#f4d34f", centerDark: "#ffffff" },
      pink: { label: "Pink", petal: "#f2aac4", shade: "#d982a2", light: "#f9d0de", center: "#f4d34f", centerDark: "#ffffff" },
    },
  },
  iris: {
    id: "iris",
    name: "Iris",
    meanings: ["Hope", "Faith", "Good news"],
    category: "secondary",
    baseSize: 0.95,
    variants: 2,
    colors: {
      violet: { label: "Violet", petal: "#6f5bc0", shade: "#4c3b97", light: "#9d8fdc", center: "#f4c63c" },
      blue: { label: "Blue", petal: "#5d7fd0", shade: "#3d5aa6", light: "#8fa9e6", center: "#f4c63c" },
      white: { label: "White", petal: "#f7f4fb", shade: "#d9d2e6", light: "#ffffff", center: "#f4c63c" },
    },
  },
  orchid: {
    id: "orchid",
    name: "Orchid",
    meanings: ["Beauty", "Strength", "Admiration"],
    category: "focal",
    baseSize: 1,
    variants: 2,
    colors: {
      white: { label: "White", petal: "#fdfafb", shade: "#e7dce2", light: "#ffffff", center: "#e0577f", centerDark: "#f3c84a" },
      orchid: { label: "Orchid", petal: "#d78bd0", shade: "#b261ab", light: "#ecbbe7", center: "#8c2f7f", centerDark: "#f3c84a" },
      blush: { label: "Blush", petal: "#f6c9d4", shade: "#dfa0b0", light: "#fde5eb", center: "#c9406a", centerDark: "#f3c84a" },
    },
  },
  lavender: {
    id: "lavender",
    name: "Lavender",
    meanings: ["Calm", "Devotion", "Serenity"],
    category: "secondary",
    spike: true,
    baseSize: 0.9,
    variants: 2,
    colors: {
      lavender: { label: "Lavender", petal: "#a68bd6", shade: "#7f63b8", light: "#c8b6eb", center: "#6c8a5c" },
    },
  },
  "babys-breath": {
    id: "babys-breath",
    name: "Baby's Breath",
    meanings: ["Everlasting love", "Sincerity"],
    category: "filler",
    baseSize: 0.85,
    variants: 3,
    colors: {
      white: { label: "White", petal: "#ffffff", shade: "#e6e1dc", light: "#ffffff", center: "#9fb08f" },
      blush: { label: "Blush", petal: "#fbe3e8", shade: "#ebc4cd", light: "#ffffff", center: "#9fb08f" },
    },
  },
  eucalyptus: {
    id: "eucalyptus",
    name: "Eucalyptus",
    meanings: ["Protection", "Healing"],
    category: "filler",
    baseSize: 1,
    variants: 2,
    colors: {
      silver: { label: "Silver", petal: "#9db5a6", shade: "#7a9585", light: "#c0d2c6", center: "#7a9585" },
      sage: { label: "Sage", petal: "#8aa37a", shade: "#6a845c", light: "#b0c4a2", center: "#6a845c" },
    },
  },
};

export const FLOWERS: FlowerDef[] = FLOWER_IDS.map((id) => CATALOG[id]);

export function getColor(id: FlowerId, color: string): FlowerColor {
  const def = CATALOG[id];
  return def.colors[color] ?? Object.values(def.colors)[0];
}

export function defaultColor(id: FlowerId): string {
  return Object.keys(CATALOG[id].colors)[0];
}
