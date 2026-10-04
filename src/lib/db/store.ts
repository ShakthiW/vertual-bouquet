import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Redis } from "@upstash/redis";
import type { BouquetRecord } from "@/lib/bouquet/schema";

// Where bouquets live. Two implementations of one small interface:
//
//   Upstash Redis   when UPSTASH_REDIS_REST_URL/TOKEN (or the KV_REST_API_*
//                   names the Vercel Marketplace sets) are present.
//   A local file    in development only (.data/bouquets.json), so the app
//                   runs end to end before any account exists.
//
// In production without credentials it refuses, rather than accepting
// bouquets into a store that disappears.

export interface BouquetStore {
  save(record: BouquetRecord, manageToken: string): Promise<void>;
  get(id: string): Promise<BouquetRecord | null>;
  /** First open wins; later opens leave the original time alone. */
  markOpened(id: string, at: string): Promise<void>;
  idForToken(token: string): Promise<string | null>;
  remove(id: string, token: string): Promise<void>;
  readonly kind: "redis" | "file";
}

const key = {
  bouquet: (id: string) => `bq:${id}`,
  manage: (token: string) => `mg:${token}`,
};

// --- Upstash Redis ---------------------------------------------------------------

function redisFromEnv(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

class RedisStore implements BouquetStore {
  readonly kind = "redis";
  constructor(private redis: Redis) {}

  async save(record: BouquetRecord, manageToken: string) {
    // Never overwrite: ids are random, but a collision must not replace a gift.
    const ok = await this.redis.set(key.bouquet(record.id), record, { nx: true });
    if (ok !== "OK") throw new Error("id collision");
    await this.redis.set(key.manage(manageToken), record.id);
  }

  async get(id: string) {
    return (await this.redis.get<BouquetRecord>(key.bouquet(id))) ?? null;
  }

  async markOpened(id: string, at: string) {
    const record = await this.get(id);
    if (!record || record.openedAt) return;
    await this.redis.set(key.bouquet(id), { ...record, openedAt: at }, { xx: true });
  }

  async idForToken(token: string) {
    return (await this.redis.get<string>(key.manage(token))) ?? null;
  }

  async remove(id: string, token: string) {
    await this.redis.del(key.bouquet(id), key.manage(token));
  }
}

// --- local file (development) -------------------------------------------------------

type FileData = { bouquets: Record<string, BouquetRecord>; tokens: Record<string, string> };

export class FileStore implements BouquetStore {
  readonly kind = "file";
  // Serialise writes so two quick saves can't clobber each other.
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private path: string) {}

  private async read(): Promise<FileData> {
    try {
      return JSON.parse(await readFile(this.path, "utf8")) as FileData;
    } catch {
      return { bouquets: {}, tokens: {} };
    }
  }

  private update(change: (data: FileData) => void) {
    const run = this.queue.then(async () => {
      const data = await this.read();
      change(data);
      await mkdir(dirname(this.path), { recursive: true });
      const tmp = `${this.path}.tmp`;
      await writeFile(tmp, JSON.stringify(data, null, 2));
      await rename(tmp, this.path);
    });
    this.queue = run.catch(() => {});
    return run;
  }

  async save(record: BouquetRecord, manageToken: string) {
    await this.update((d) => {
      if (d.bouquets[record.id]) throw new Error("id collision");
      d.bouquets[record.id] = record;
      d.tokens[manageToken] = record.id;
    });
  }

  async get(id: string) {
    return (await this.read()).bouquets[id] ?? null;
  }

  async markOpened(id: string, at: string) {
    await this.update((d) => {
      const r = d.bouquets[id];
      if (r && !r.openedAt) r.openedAt = at;
    });
  }

  async idForToken(token: string) {
    return (await this.read()).tokens[token] ?? null;
  }

  async remove(id: string, token: string) {
    await this.update((d) => {
      delete d.bouquets[id];
      delete d.tokens[token];
    });
  }
}

// --- choosing one ------------------------------------------------------------------

let cached: BouquetStore | undefined;

export function getStore(): BouquetStore {
  if (cached) return cached;
  const redis = redisFromEnv();
  if (redis) return (cached = new RedisStore(redis));
  if (process.env.NODE_ENV === "production" && !process.env.VB_ALLOW_FILE_STORE) {
    throw new Error(
      "No database configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or connect Upstash in the Vercel Marketplace).",
    );
  }
  return (cached = new FileStore(join(process.cwd(), ".data", "bouquets.json")));
}
