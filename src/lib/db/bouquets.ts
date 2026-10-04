import "server-only";

import { cache } from "react";
import { BouquetInputSchema, type BouquetRecord } from "@/lib/bouquet/schema";
import type { BouquetStore } from "./store";
import { getStore } from "./store";

export const ID_LENGTH = 10;
export const TOKEN_LENGTH = 24;
const ID_PATTERN = new RegExp(`^[A-Za-z0-9_-]{${ID_LENGTH}}$`);
const TOKEN_PATTERN = new RegExp(`^[A-Za-z0-9_-]{${TOKEN_LENGTH}}$`);

export const isBouquetId = (id: string) => ID_PATTERN.test(id);
export const isManageToken = (t: string) => TOKEN_PATTERN.test(t);

export type CreateResult =
  | { ok: true; id: string; manageToken: string }
  | { ok: false; error: "invalid" | "rate_limited" | "unavailable"; message: string };

export type CreateDeps = {
  store: BouquetStore;
  limit: (key: string) => Promise<{ ok: boolean }>;
  /** Who is asking (an IP), for the rate limit. */
  clientKey: string;
  newId: () => string;
  newToken: () => string;
  now: () => Date;
};

/**
 * Validate, rate-limit and save a bouquet. Everything it needs is passed in,
 * so it is tested directly; the server action only supplies the real pieces.
 */
export async function createBouquet(input: unknown, deps: CreateDeps): Promise<CreateResult> {
  const parsed = BouquetInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid", message: "Something about this bouquet didn't look right. Try again from the Studio." };
  }

  const { ok } = await deps.limit(deps.clientKey);
  if (!ok) {
    return { ok: false, error: "rate_limited", message: "That's a lot of bouquets in a short time. Try again in a little while." };
  }

  const manageToken = deps.newToken();
  // Ids are random and long enough that a collision is vanishingly rare, but
  // a collision must never overwrite somebody's gift: retry instead.
  for (let attempt = 0; attempt < 3; attempt++) {
    const record: BouquetRecord = { ...parsed.data, id: deps.newId(), createdAt: deps.now().toISOString() };
    try {
      await deps.store.save(record, manageToken);
      return { ok: true, id: record.id, manageToken };
    } catch (e) {
      if (e instanceof Error && e.message === "id collision") continue;
      console.error("createBouquet: save failed", e);
      return { ok: false, error: "unavailable", message: "We couldn't save your bouquet just now. Your draft is safe, so try again in a moment." };
    }
  }
  return { ok: false, error: "unavailable", message: "We couldn't save your bouquet just now. Try again in a moment." };
}

/** Read a bouquet, once per request even if metadata and page both ask. */
export const getBouquet = cache(async (id: string): Promise<BouquetRecord | null> => {
  if (!isBouquetId(id)) return null;
  try {
    return await getStore().get(id);
  } catch (e) {
    console.error("getBouquet failed", e);
    return null;
  }
});

/** The sender's view: their bouquet, found by its private token. */
export async function getByManageToken(token: string): Promise<BouquetRecord | null> {
  if (!isManageToken(token)) return null;
  try {
    const store = getStore();
    const id = await store.idForToken(token);
    return id ? await store.get(id) : null;
  } catch (e) {
    console.error("getByManageToken failed", e);
    return null;
  }
}
