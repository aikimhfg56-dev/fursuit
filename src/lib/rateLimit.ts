import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isRateLimitConfigured } from "@/lib/env";

/** Matches @upstash/ratelimit's own Duration type (e.g. "10 m", "60 s"). */
type Duration = `${number} ${"ms" | "s" | "m" | "h" | "d"}`;

type LimiterLike = {
  limit(identifier: string): Promise<{ success: boolean }>;
};

let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redisClient;
}

const DURATION_MULTIPLIERS_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

function parseDurationMs(duration: Duration): number {
  const [amount, unit] = duration.split(" ");
  return Number(amount) * (DURATION_MULTIPLIERS_MS[unit] ?? 1000);
}

/**
 * Per-process, in-memory sliding-window limiter used when Upstash isn't
 * configured. Real protection needs a shared store — serverless instances
 * don't share memory and a cold start wipes it — so this is a soft
 * deterrent for local dev, not a production guarantee. Add
 * UPSTASH_REDIS_REST_URL/TOKEN (see .env.local.example) for the real thing.
 */
class InMemoryRateLimiter implements LimiterLike {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly limitCount: number,
    private readonly windowMs: number,
  ) {}

  async limit(identifier: string): Promise<{ success: boolean }> {
    const now = Date.now();
    const recentHits = (this.hits.get(identifier) ?? []).filter((timestamp) => now - timestamp < this.windowMs);

    if (recentHits.length >= this.limitCount) {
      this.hits.set(identifier, recentHits);
      return { success: false };
    }

    recentHits.push(now);
    this.hits.set(identifier, recentHits);
    return { success: true };
  }
}

const limiterCache = new Map<string, LimiterLike>();

/** One limiter instance per (name, limit, window), reused across requests within the process. */
export function getRateLimiter(name: string, limit: number, window: Duration): LimiterLike {
  const cacheKey = `${name}:${limit}:${window}`;
  const cached = limiterCache.get(cacheKey);
  if (cached) return cached;

  const limiter: LimiterLike = isRateLimitConfigured()
    ? new Ratelimit({
        redis: getRedisClient(),
        limiter: Ratelimit.slidingWindow(limit, window),
        prefix: `ratelimit:${name}`,
      })
    : new InMemoryRateLimiter(limit, parseDurationMs(window));

  limiterCache.set(cacheKey, limiter);
  return limiter;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
