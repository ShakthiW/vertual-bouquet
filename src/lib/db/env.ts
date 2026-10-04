// Where the Upstash Redis credentials come from. Names differ by how the
// database was created, so accept all of them:
//
//   UPSTASH_REDIS_REST_URL / _TOKEN      created in the Upstash console
//   KV_REST_API_URL / _TOKEN             Vercel Marketplace, no prefix
//   <PREFIX>KV_REST_API_URL / _TOKEN     Vercel Marketplace with a prefix,
//                                        e.g. UPSTASH_KV_REST_API_URL
//
// The read-only token is never used: saving bouquets needs write access.

type Env = Record<string, string | undefined>;

export function redisCredentials(env: Env = process.env): { url: string; token: string } | null {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return { url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN };
  }
  // Unprefixed first, then any prefix, in a stable order.
  const urlKeys = Object.keys(env)
    .filter((k) => k.endsWith("KV_REST_API_URL"))
    .sort((a, b) => a.length - b.length || a.localeCompare(b));
  for (const urlKey of urlKeys) {
    const prefix = urlKey.slice(0, -"KV_REST_API_URL".length);
    const url = env[urlKey];
    const token = env[`${prefix}KV_REST_API_TOKEN`];
    if (url && token) return { url, token };
  }
  return null;
}
