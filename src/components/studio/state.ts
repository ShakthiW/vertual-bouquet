// Studio state: one draft, changed only through this reducer, with undo.
//
// The draft keeps both what the sender picked (`picks`) and where everything
// sits (`flowers`). Changing the picks re-arranges from scratch; editing a
// placement (drag, rotate, recolour...) only touches `flowers`, keeping the
// matching pick in step so a later re-arrange keeps the change of colour.

import { arrange, type Pick as FlowerPick } from "@/lib/arrange/arrange";
import { LIMITS } from "@/lib/bouquet/limits";
import type { BouquetInput, BouquetVisual, FlowerPlacement } from "@/lib/bouquet/schema";
import type { CardFontId, PaperId, RibbonId, StyleId } from "@/lib/bouquet/wrap";
import { CATALOG, type FlowerId } from "@/lib/flowers/catalog";

export const STEPS = ["flowers", "arrange", "wrap", "card", "preview"] as const;
export type Step = (typeof STEPS)[number];

export type Draft = {
  version: 1;
  step: Step;
  picks: FlowerPick[];
  flowers: FlowerPlacement[];
  seed: number;
  greenery: boolean;
  style: StyleId;
  wrap: { paper: PaperId; ribbon: RibbonId };
  card: { to: string; message: string; from: string; font: CardFontId };
  /** Set once the bouquet has been saved: the Studio then shows the share sheet. */
  sent?: { id: string; manageToken: string; at: string };
};

export type State = {
  draft: Draft;
  past: Draft[];
  /** Index into draft.flowers of the flower being edited, if any. */
  selected: number | null;
  /** Bumped when flowers should glide to new spots (arrange/shuffle), not jump. */
  glide: number;
};

export type Action =
  | { type: "goto"; step: Step }
  | { type: "addPick"; flower: FlowerId; color: string }
  | { type: "removePick"; flower: FlowerId }
  | { type: "arrange" }
  | { type: "shuffle"; seed: number }
  | { type: "select"; index: number | null }
  | { type: "beginEdit" }
  | { type: "moveFlower"; index: number; x: number; y: number }
  | {
      type: "updateFlower";
      index: number;
      patch: Partial<Pick<FlowerPlacement, "color" | "rotation" | "scale">>;
      /** Mid-gesture (a slider being dragged): don't add an undo step; beginEdit did. */
      live?: boolean;
    }
  | { type: "removeFlower"; index: number }
  | { type: "reorder"; index: number; to: "front" | "back" }
  | { type: "setStyle"; style: StyleId }
  | { type: "setPaper"; paper: PaperId }
  | { type: "setRibbon"; ribbon: RibbonId }
  | { type: "setCard"; patch: Partial<Draft["card"]> }
  | { type: "sent"; id: string; manageToken: string; at: string }
  | { type: "undo" }
  | { type: "restore"; draft: Draft }
  | { type: "reset"; seed: number; to?: string };

export const UNDO_LIMIT = 40;

/** Where a dragged head may go: inside the frame, above the wrap. */
export const MOVE_BOUNDS = { x: [0.08, 0.92], y: [0.08, 0.6] } as const;

export function freshDraft(seed: number, to = ""): Draft {
  return {
    version: 1,
    step: "flowers",
    picks: [],
    flowers: [],
    seed,
    greenery: true,
    style: "romantic",
    wrap: { paper: "blush", ribbon: "wine" },
    card: { to: to.slice(0, LIMITS.nameLength), message: "", from: "", font: "caveat" },
  };
}

export function initialState(draft: Draft): State {
  return { draft, past: [], selected: null, glide: 0 };
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const bloomCount = (picks: FlowerPick[]) => picks.length;

function rearranged(d: Draft): Draft {
  return { ...d, flowers: arrange(d.picks, { seed: d.seed, greenery: d.greenery }) };
}

/** Undoable change: remember the present first. */
function commit(s: State, draft: Draft, extra: Partial<State> = {}): State {
  return { ...s, ...extra, past: [...s.past, s.draft].slice(-UNDO_LIMIT), draft };
}

/** Find the pick a placement came from (greenery the engine added has none). */
function pickIndexOf(picks: FlowerPick[], f: FlowerPick) {
  return picks.findIndex((p) => p.type === f.type && p.color === f.color);
}

export function reducer(s: State, a: Action): State {
  const d = s.draft;
  switch (a.type) {
    case "goto":
      return { ...s, selected: null, draft: { ...d, step: a.step } };

    case "addPick": {
      if (bloomCount(d.picks) >= LIMITS.maxFlowers) return s;
      const picks = [...d.picks, { type: a.flower, color: a.color }];
      return commit(s, rearranged({ ...d, picks }), { selected: null, glide: s.glide + 1 });
    }

    case "removePick": {
      // Remove the most recently added one of this flower.
      const at = d.picks.map((p) => p.type).lastIndexOf(a.flower);
      if (at < 0) return s;
      const picks = d.picks.filter((_, i) => i !== at);
      return commit(s, rearranged({ ...d, picks }), { selected: null, glide: s.glide + 1 });
    }

    case "arrange":
      return commit(s, rearranged({ ...d, greenery: true }), { selected: null, glide: s.glide + 1 });

    case "shuffle":
      return commit(s, rearranged({ ...d, seed: a.seed }), { selected: null, glide: s.glide + 1 });

    case "select":
      return { ...s, selected: a.index };

    case "beginEdit":
      // Snapshot before a drag so one undo returns the flower to where it was.
      return commit(s, d);

    case "moveFlower": {
      const flowers = d.flowers.map((f, i) =>
        i === a.index
          ? {
              ...f,
              x: Math.round(clamp(a.x, ...MOVE_BOUNDS.x) * 1000) / 1000,
              y: Math.round(clamp(a.y, ...MOVE_BOUNDS.y) * 1000) / 1000,
            }
          : f,
      );
      // Not committed: a drag sends many moves; beginEdit took the snapshot.
      return { ...s, draft: { ...d, flowers } };
    }

    case "updateFlower": {
      const old = d.flowers[a.index];
      if (!old) return s;
      const next: FlowerPlacement = {
        ...old,
        ...a.patch,
        rotation: clamp(a.patch.rotation ?? old.rotation, -45, 45),
        scale: clamp(a.patch.scale ?? old.scale, 0.6, 1.4),
      };
      const flowers = d.flowers.map((f, i) => (i === a.index ? next : f));
      let picks = d.picks;
      if (a.patch.color && a.patch.color !== old.color) {
        const at = pickIndexOf(picks, old);
        if (at >= 0) picks = picks.map((p, i) => (i === at ? { ...p, color: next.color } : p));
      }
      const draft = { ...d, flowers, picks };
      return a.live ? { ...s, draft } : commit(s, draft);
    }

    case "removeFlower": {
      const old = d.flowers[a.index];
      if (!old) return s;
      const flowers = d.flowers.filter((_, i) => i !== a.index);
      const at = pickIndexOf(d.picks, old);
      const picks = at >= 0 ? d.picks.filter((_, i) => i !== at) : d.picks;
      // Removing greenery the engine added means "no automatic greenery, please".
      const greenery = at >= 0 || CATALOG[old.type].category !== "filler" ? d.greenery : false;
      return commit(s, { ...d, flowers, picks, greenery }, { selected: null });
    }

    case "reorder": {
      if (!d.flowers[a.index]) return s;
      // Draw order: everyone else in their current order, with this flower
      // moved to the end (front) or the start (back). z is then the position.
      const rest = d.flowers.map((f, i) => ({ z: f.z, i })).filter((o) => o.i !== a.index).sort((p, q) => p.z - q.z);
      const order = a.to === "front" ? [...rest.map((o) => o.i), a.index] : [a.index, ...rest.map((o) => o.i)];
      const flowers = d.flowers.map((f, i) => ({ ...f, z: order.indexOf(i) }));
      return commit(s, { ...d, flowers });
    }

    case "setStyle":
      return commit(s, { ...d, style: a.style });
    case "setPaper":
      return commit(s, { ...d, wrap: { ...d.wrap, paper: a.paper } });
    case "setRibbon":
      return commit(s, { ...d, wrap: { ...d.wrap, ribbon: a.ribbon } });

    case "setCard": {
      const card = { ...d.card, ...a.patch };
      card.to = card.to.slice(0, LIMITS.nameLength);
      card.from = card.from.slice(0, LIMITS.nameLength);
      card.message = card.message.slice(0, LIMITS.messageLength);
      // Typing is not undoable keystroke by keystroke; the browser handles that.
      return { ...s, draft: { ...d, card } };
    }

    case "sent":
      // Not undoable: the bouquet exists now. History is dropped with it.
      return { ...s, past: [], selected: null, draft: { ...d, sent: { id: a.id, manageToken: a.manageToken, at: a.at } } };

    case "undo": {
      const prev = s.past.at(-1);
      if (!prev) return s;
      return { ...s, draft: { ...prev, step: d.step }, past: s.past.slice(0, -1), selected: null, glide: s.glide + 1 };
    }

    case "restore":
      return initialState(a.draft);

    case "reset":
      return commit(s, freshDraft(a.seed, a.to), { selected: null });
  }
}

// --- selectors -------------------------------------------------------------------

export const visualOf = (d: Draft): BouquetVisual => ({ style: d.style, wrap: d.wrap, flowers: d.flowers });

export const pickCount = (d: Draft, flower: FlowerId) => d.picks.filter((p) => p.type === flower).length;

/** What would be saved, or null with a reason the sender can act on. */
export function readiness(d: Draft): { ok: true; input: BouquetInput } | { ok: false; step: Step; reason: string } {
  if (d.flowers.length === 0) return { ok: false, step: "flowers", reason: "Pick at least one flower." };
  if (!d.card.to.trim()) return { ok: false, step: "card", reason: "Who is it for? Add their name." };
  if (!d.card.from.trim()) return { ok: false, step: "card", reason: "Sign the card with your name." };
  return {
    ok: true,
    input: {
      style: d.style,
      flowers: d.flowers,
      wrap: d.wrap,
      card: { ...d.card, to: d.card.to.trim(), from: d.card.from.trim(), message: d.card.message.trim() },
    },
  };
}

// --- persistence -----------------------------------------------------------------

export const DRAFT_KEY = "vb:draft:v1";

export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    if (d?.version !== 1 || !Array.isArray(d.picks) || !Array.isArray(d.flowers)) return null;
    if (!d.flowers.every((f) => f.type in CATALOG)) return null;
    return { ...d, step: STEPS.includes(d.step) ? d.step : "flowers" };
  } catch {
    return null;
  }
}

export function saveDraft(d: Draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    // Private mode or storage full: the Studio still works, it just won't resume.
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}
