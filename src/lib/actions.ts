"use server";

// Server Actions are public POST endpoints: anyone can call them with any
// payload, so every input is validated inside (see createBouquet).

import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { createBouquet, ID_LENGTH, isBouquetId, isManageToken, TOKEN_LENGTH, type CreateResult } from "@/lib/db/bouquets";
import { createLimiter } from "@/lib/db/ratelimit";
import { getStore } from "@/lib/db/store";

async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export async function createBouquetAction(input: unknown): Promise<CreateResult> {
  let store;
  try {
    store = getStore();
  } catch (e) {
    console.error(e);
    return { ok: false, error: "unavailable", message: "Sending isn't set up on this server yet." };
  }
  return createBouquet(input, {
    store,
    limit: createLimiter(),
    clientKey: await clientKey(),
    newId: () => nanoid(ID_LENGTH),
    newToken: () => nanoid(TOKEN_LENGTH),
    now: () => new Date(),
  });
}

export async function deleteBouquetAction(token: unknown): Promise<{ ok: boolean }> {
  if (typeof token !== "string" || !isManageToken(token)) return { ok: false };
  try {
    const store = getStore();
    const id = await store.idForToken(token);
    if (!id) return { ok: false };
    await store.remove(id, token);
    return { ok: true };
  } catch (e) {
    console.error("deleteBouquetAction failed", e);
    return { ok: false };
  }
}

/** Called on the recipient's first tap. Idempotent: the first open wins. */
export async function markOpenedAction(id: unknown): Promise<void> {
  if (typeof id !== "string" || !isBouquetId(id)) return;
  try {
    await getStore().markOpened(id, new Date().toISOString());
  } catch (e) {
    console.error("markOpenedAction failed", e);
  }
}
