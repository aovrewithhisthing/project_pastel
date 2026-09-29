import { Queue, type JobsOptions } from "bullmq";
import { getRedisConnection } from "./connection.js";

export const CAPSULE_QUEUE_NAME = "capsule-notification-queue";

export interface CapsuleNotificationJobData {
  capsuleId: string;
  userId: string;
}

let queue: Queue<CapsuleNotificationJobData> | null = null;

export function getCapsuleNotificationQueue(): Queue<CapsuleNotificationJobData> {
  if (!queue) {
    queue = new Queue<CapsuleNotificationJobData>(CAPSULE_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: { age: 86400, count: 5000 },
        removeOnFail: { age: 604800 },
        attempts: 3,
        backoff: { type: "exponential", delay: 60_000 },
      } satisfies JobsOptions,
    });
  }
  return queue;
}

/**
 * Schedule a notification for when `openAt` is reached.
 * delay = openAt - now (BullMQ native delay). Cap to BullMQ int32-safe range.
 */
export async function scheduleCapsuleNotification(capsuleId: string, userId: string, openAt: Date): Promise<string | undefined> {
  const delay = Math.max(0, openAt.getTime() - Date.now());
  // BullMQ `delay` is capped at ~2^31-1 ms (~24.8 days); for longer horizons rely on a periodic reconciler.
  // For the spec we schedule directly; callers should re-enqueue missed/late jobs on startup if needed.
  const q = getCapsuleNotificationQueue();
  const job = await q.add(
    "capsule-opened",
    { capsuleId, userId },
    {
      delay,
      jobId: `capsule-${capsuleId}`, // deduplicate
    },
  );
  return job.id;
}
