import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

/** Shared Upstash Redis client — used by the rate limiter and the seller product store. */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redisClient;
}
