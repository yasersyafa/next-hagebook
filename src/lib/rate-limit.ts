import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  if (!URL || !TOKEN) return null;
  redis = new Redis({ url: URL, token: TOKEN });
  return redis;
}

const limiters = new Map<string, Ratelimit>();
function get(name: string, limit: number, window: `${number}s` | `${number}m` | `${number}h` | `${number}d`): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  const key = `${name}:${limit}:${window}`;
  let l = limiters.get(key);
  if (!l) {
    l = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `hagebook:${name}`,
      analytics: false,
    });
    limiters.set(key, l);
  }
  return l;
}

export async function checkRateLimit(opts: {
  name: string;
  identifier: string;
  limit: number;
  window: `${number}s` | `${number}m` | `${number}h` | `${number}d`;
}): Promise<{ ok: true } | { ok: false; reset: number; remaining: number }> {
  const l = get(opts.name, opts.limit, opts.window);
  // No Upstash configured — allow.
  if (!l) return { ok: true };
  const r = await l.limit(opts.identifier);
  if (r.success) return { ok: true };
  return { ok: false, reset: r.reset, remaining: r.remaining };
}
