import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { redisCredentials } from "./env";

// Bouquets per visitor per hour. Generous for people, tight for scripts.
export const CREATE_LIMIT = { count: 20, windowSeconds: 60 * 60 };

type Limiter = (key: string) => Promise<{ ok: boolean }>;

function upstashLimiter(): Limiter | null {
  const creds = redisCredentials();
  if (!creds) return null;
  const rl = new Ratelimit({
    redis: new Redis(creds),
    limiter: Ratelimit.slidingWindow(CREATE_LIMIT.count, `${CREATE_LIMIT.windowSeconds} s`),
    prefix: "rl:create",
  });
  return async (key) => ({ ok: (await rl.limit(key)).success });
}

/** In-process fallback for development: fine for one server, forgets on restart. */
export function memoryLimiter(count = CREATE_LIMIT.count, windowMs = CREATE_LIMIT.windowSeconds * 1000): Limiter {
  const hits = new Map<string, number[]>();
  return async (key) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= count) {
      hits.set(key, recent);
      return { ok: false };
    }
    hits.set(key, [...recent, now]);
    return { ok: true };
  };
}

let cached: Limiter | undefined;
export const createLimiter = (): Limiter => (cached ??= upstashLimiter() ?? memoryLimiter());
