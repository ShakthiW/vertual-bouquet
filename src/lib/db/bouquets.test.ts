import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SAMPLES } from "@/lib/bouquet/samples";
import { createBouquet, isBouquetId, isManageToken, type CreateDeps } from "./bouquets";
import { memoryLimiter } from "./ratelimit";
import { FileStore } from "./store";

const input = {
  ...SAMPLES.romantic,
  card: { to: "Maya", message: "Hope this makes your day a little brighter.", from: "Shakthi", font: "caveat" },
};

let dir: string;
let store: FileStore;
let counter = 0;

const deps = (over: Partial<CreateDeps> = {}): CreateDeps => ({
  store,
  limit: memoryLimiter(100, 60_000),
  clientKey: "1.2.3.4",
  newId: () => `id${String(counter++).padStart(8, "0")}`,
  newToken: () => "t".repeat(24),
  now: () => new Date("2026-10-03T21:00:00Z"),
  ...over,
});

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "vb-"));
  store = new FileStore(join(dir, "bouquets.json"));
});
afterEach(() => rm(dir, { recursive: true, force: true }));

describe("createBouquet", () => {
  it("saves a valid bouquet and returns its id and private token", async () => {
    const r = await createBouquet(input, deps());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const saved = await store.get(r.id);
    expect(saved?.card.to).toBe("Maya");
    expect(saved?.createdAt).toBe("2026-10-03T21:00:00.000Z");
    expect(await store.idForToken(r.manageToken)).toBe(r.id);
  });

  it("rejects anything the schema does not accept, and saves nothing", async () => {
    for (const bad of [null, "hi", {}, { ...input, flowers: [] }, { ...input, card: { ...input.card, to: "" } }, { ...input, extra: "<script>" , style: "neon" }]) {
      const r = await createBouquet(bad, deps());
      expect(r).toMatchObject({ ok: false, error: "invalid" });
    }
    expect(await store.get("id00000000")).toBeNull();
  });

  it("strips fields it does not know about", async () => {
    const r = await createBouquet({ ...input, admin: true, card: { ...input.card, html: "<b>x</b>" } }, deps());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const saved = (await store.get(r.id)) as unknown as Record<string, unknown>;
    expect(saved.admin).toBeUndefined();
    expect((saved.card as Record<string, unknown>).html).toBeUndefined();
  });

  it("rate-limits per visitor", async () => {
    const limit = memoryLimiter(2, 60_000);
    expect((await createBouquet(input, deps({ limit }))).ok).toBe(true);
    expect((await createBouquet(input, deps({ limit }))).ok).toBe(true);
    expect(await createBouquet(input, deps({ limit }))).toMatchObject({ ok: false, error: "rate_limited" });
    // Someone else is unaffected.
    expect((await createBouquet(input, deps({ limit, clientKey: "5.6.7.8" }))).ok).toBe(true);
  });

  it("never overwrites an existing bouquet when an id repeats", async () => {
    const first = await createBouquet(input, deps({ newId: () => "sameid0000" }));
    expect(first.ok).toBe(true);
    const ids = ["sameid0000", "otherid000"];
    const second = await createBouquet({ ...input, card: { ...input.card, to: "Ana" } }, deps({ newId: () => ids.shift()! }));
    expect(second).toMatchObject({ ok: true, id: "otherid000" });
    expect((await store.get("sameid0000"))?.card.to).toBe("Maya");
  });

  it("reports a friendly error when storage fails", async () => {
    const broken = { ...store, kind: "file" as const, save: async () => { throw new Error("disk full"); } };
    const r = await createBouquet(input, deps({ store: broken as unknown as FileStore }));
    expect(r).toMatchObject({ ok: false, error: "unavailable" });
  });
});

describe("FileStore", () => {
  it("records only the first open", async () => {
    const r = await createBouquet(input, deps());
    if (!r.ok) throw new Error("save failed");
    await store.markOpened(r.id, "2026-10-04T08:00:00Z");
    await store.markOpened(r.id, "2026-10-05T08:00:00Z");
    expect((await store.get(r.id))?.openedAt).toBe("2026-10-04T08:00:00Z");
  });

  it("removes a bouquet and its token", async () => {
    const r = await createBouquet(input, deps());
    if (!r.ok) throw new Error("save failed");
    await store.remove(r.id, r.manageToken);
    expect(await store.get(r.id)).toBeNull();
    expect(await store.idForToken(r.manageToken)).toBeNull();
  });

  it("survives concurrent saves", async () => {
    const results = await Promise.all(Array.from({ length: 12 }, () => createBouquet(input, deps())));
    for (const r of results) {
      expect(r.ok).toBe(true);
      if (r.ok) expect(await store.get(r.id)).not.toBeNull();
    }
  });
});

describe("id and token shapes", () => {
  it("accepts only the shapes we generate", () => {
    expect(isBouquetId("aB3_x-9QzK")).toBe(true);
    for (const bad of ["", "short", "aB3_x-9QzKX", "../../etc/x", "aB3 x-9QzK", "bq:abcdefg"]) expect(isBouquetId(bad)).toBe(false);
    expect(isManageToken("a".repeat(24))).toBe(true);
    expect(isManageToken("a".repeat(23))).toBe(false);
  });
});
