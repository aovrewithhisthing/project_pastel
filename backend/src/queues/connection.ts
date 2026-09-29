import IORedis from "ioredis";
import { env } from "../config/env.js";

/** BullMQ requires `maxRetriesPerRequest: null` and `enableReadyCheck: false`. */
let redis: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redis) {
    redis = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    redis.on("error", (e) => console.error("[redis]", e.message));
  }
  return redis;
}
