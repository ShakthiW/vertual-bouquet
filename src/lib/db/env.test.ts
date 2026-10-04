import { describe, expect, it } from "vitest";
import { redisCredentials } from "./env";

describe("redisCredentials", () => {
  it("reads Upstash console names", () => {
    expect(redisCredentials({ UPSTASH_REDIS_REST_URL: "https://a", UPSTASH_REDIS_REST_TOKEN: "t" })).toEqual({ url: "https://a", token: "t" });
  });

  it("reads Vercel Marketplace names, with and without a prefix", () => {
    expect(redisCredentials({ KV_REST_API_URL: "https://b", KV_REST_API_TOKEN: "t" })).toEqual({ url: "https://b", token: "t" });
    expect(redisCredentials({ UPSTASH_KV_REST_API_URL: "https://c", UPSTASH_KV_REST_API_TOKEN: "t" })).toEqual({ url: "https://c", token: "t" });
  });

  it("never uses the read-only token", () => {
    expect(redisCredentials({ UPSTASH_KV_REST_API_URL: "https://c", UPSTASH_KV_REST_API_READ_ONLY_TOKEN: "ro" })).toBeNull();
    expect(
      redisCredentials({
        UPSTASH_KV_REST_API_URL: "https://c",
        UPSTASH_KV_REST_API_READ_ONLY_TOKEN: "ro",
        UPSTASH_KV_REST_API_TOKEN: "rw",
      }),
    ).toEqual({ url: "https://c", token: "rw" });
  });

  it("ignores the redis:// TCP URLs and incomplete pairs", () => {
    expect(redisCredentials({ UPSTASH_KV_URL: "redis://x", UPSTASH_REDIS_URL: "redis://x" })).toBeNull();
    expect(redisCredentials({ KV_REST_API_URL: "https://b" })).toBeNull();
    expect(redisCredentials({})).toBeNull();
  });

  it("prefers the unprefixed pair when several exist", () => {
    expect(
      redisCredentials({ STORE2_KV_REST_API_URL: "https://2", STORE2_KV_REST_API_TOKEN: "2", KV_REST_API_URL: "https://1", KV_REST_API_TOKEN: "1" }),
    ).toEqual({ url: "https://1", token: "1" });
  });
});
