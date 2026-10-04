import { describe, expect, it } from "vitest";
import { LIMITS } from "@/lib/bouquet/limits";
import { BouquetInputSchema } from "@/lib/bouquet/schema";
import { CATALOG } from "@/lib/flowers/catalog";
import { freshDraft, initialState, readiness, reducer, UNDO_LIMIT, type Action, type State } from "./state";

const run = (actions: Action[], start: State = initialState(freshDraft(7))) => actions.reduce(reducer, start);

const roses = (n: number): Action[] => Array.from({ length: n }, () => ({ type: "addPick", flower: "rose", color: "red" }));

describe("studio reducer", () => {
  it("arranges as flowers are picked, adding greenery", () => {
    const s = run(roses(3));
    expect(s.draft.picks).toHaveLength(3);
    expect(s.draft.flowers.length).toBeGreaterThan(3);
    expect(s.draft.flowers.filter((f) => f.type === "rose")).toHaveLength(3);
  });

  it(`stops at ${LIMITS.maxFlowers} picks`, () => {
    const s = run(roses(LIMITS.maxFlowers + 3));
    expect(s.draft.picks).toHaveLength(LIMITS.maxFlowers);
    expect(s.draft.flowers.length).toBeLessThanOrEqual(LIMITS.maxStems);
  });

  it("removes the last-added pick of a flower", () => {
    const s = run([
      { type: "addPick", flower: "rose", color: "red" },
      { type: "addPick", flower: "rose", color: "white" },
      { type: "removePick", flower: "rose" },
    ]);
    expect(s.draft.picks).toEqual([{ type: "rose", color: "red" }]);
  });

  it("shuffle changes the layout but not the flowers", () => {
    const a = run(roses(5));
    const b = reducer(a, { type: "shuffle", seed: 999 });
    const kinds = (s: State) => s.draft.flowers.map((f) => `${f.type}/${f.color}`).sort();
    expect(kinds(b)).toEqual(kinds(a));
    expect(b.draft.flowers).not.toEqual(a.draft.flowers);
  });

  it("clamps drags inside the frame and above the wrap", () => {
    const s = run([...roses(2), { type: "beginEdit" }, { type: "moveFlower", index: 0, x: 2, y: 0.99 }]);
    expect(s.draft.flowers[0].x).toBeLessThanOrEqual(0.92);
    expect(s.draft.flowers[0].y).toBeLessThanOrEqual(0.6);
  });

  it("one undo puts a dragged flower back where it was", () => {
    const before = run(roses(3));
    const at = { x: before.draft.flowers[0].x, y: before.draft.flowers[0].y };
    let s = reducer(before, { type: "beginEdit" });
    for (let i = 1; i <= 10; i++) s = reducer(s, { type: "moveFlower", index: 0, x: 0.3 + i * 0.01, y: 0.3 });
    s = reducer(s, { type: "undo" });
    expect({ x: s.draft.flowers[0].x, y: s.draft.flowers[0].y }).toEqual(at);
  });

  it("undo keeps the current step", () => {
    const s = run([...roses(2), { type: "goto", step: "wrap" }, { type: "setPaper", paper: "kraft" }, { type: "undo" }]);
    expect(s.draft.wrap.paper).toBe("blush");
    expect(s.draft.step).toBe("wrap");
  });

  it(`remembers at most ${UNDO_LIMIT} steps`, () => {
    const s = run(Array.from({ length: UNDO_LIMIT + 10 }, (_, i): Action => ({ type: "shuffle", seed: i })));
    expect(s.past).toHaveLength(UNDO_LIMIT);
  });

  it("recolouring a flower updates its pick, so a re-arrange keeps the colour", () => {
    let s = run(roses(1));
    const i = s.draft.flowers.findIndex((f) => f.type === "rose");
    s = reducer(s, { type: "updateFlower", index: i, patch: { color: "yellow" } });
    expect(s.draft.picks[0].color).toBe("yellow");
    s = reducer(s, { type: "arrange" });
    expect(s.draft.flowers.find((f) => f.type === "rose")?.color).toBe("yellow");
  });

  it("limits rotation and size", () => {
    const s = run([...roses(1), { type: "updateFlower", index: 0, patch: { rotation: 90, scale: 3 } }]);
    expect(s.draft.flowers[0].rotation).toBe(45);
    expect(s.draft.flowers[0].scale).toBe(1.4);
  });

  it("removing a picked flower removes its pick", () => {
    let s = run(roses(3));
    const i = s.draft.flowers.findIndex((f) => f.type === "rose");
    s = reducer(s, { type: "removeFlower", index: i });
    expect(s.draft.picks).toHaveLength(2);
    expect(s.draft.flowers.filter((f) => f.type === "rose")).toHaveLength(2);
  });

  it("removing automatic greenery keeps it gone after shuffling", () => {
    let s = run(roses(3));
    const g = s.draft.flowers.findIndex((f) => CATALOG[f.type].category === "filler");
    s = reducer(s, { type: "removeFlower", index: g });
    s = reducer(s, { type: "shuffle", seed: 5 });
    expect(s.draft.flowers.every((f) => CATALOG[f.type].category !== "filler")).toBe(true);
  });

  it("bring to front / send to back reorders drawing", () => {
    let s = run(roses(4));
    s = reducer(s, { type: "reorder", index: 0, to: "front" });
    expect(s.draft.flowers[0].z).toBe(Math.max(...s.draft.flowers.map((f) => f.z)));
    s = reducer(s, { type: "reorder", index: 0, to: "back" });
    expect(s.draft.flowers[0].z).toBe(0);
    expect(new Set(s.draft.flowers.map((f) => f.z)).size).toBe(s.draft.flowers.length);
  });

  it("caps card fields at their limits", () => {
    const s = run([{ type: "setCard", patch: { to: "x".repeat(99), message: "y".repeat(999) } }]);
    expect(s.draft.card.to).toHaveLength(LIMITS.nameLength);
    expect(s.draft.card.message).toHaveLength(LIMITS.messageLength);
  });

  it("is ready to send only with flowers, a name and a signature, and then passes the save schema", () => {
    let s = run(roses(4));
    expect(readiness(s.draft)).toMatchObject({ ok: false, step: "card" });
    s = reducer(s, { type: "setCard", patch: { to: " Maya ", from: "Shakthi", message: "Hope this makes your day." } });
    const r = readiness(s.draft);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.input.card.to).toBe("Maya");
      expect(BouquetInputSchema.safeParse(r.input).success).toBe(true);
    }
  });

  it("starting over keeps the name passed in from the landing page", () => {
    const s = run([...roses(3), { type: "reset", seed: 1, to: "Maya" }]);
    expect(s.draft.picks).toHaveLength(0);
    expect(s.draft.card.to).toBe("Maya");
  });
});
