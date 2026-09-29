import { Worker, type Job } from "bullmq";
import { getRedisConnection } from "./connection.js";
import { CAPSULE_QUEUE_NAME, type CapsuleNotificationJobData } from "./capsuleNotification.queue.js";
import { prisma } from "../config/prisma.js";
import { sendCapsuleOpenedEmail } from "../services/mail.service.js";
import "./../config/env.js";

/**
 * Worker for `capsule-notification-queue`.
 * Run with: `npm run worker` (process terpisah dari API server).
 * Saat job berjalan (openAt tiba), kirim email ke pemilik kapsul.
 */
async function handleJob(job: Job<CapsuleNotificationJobData>): Promise<void> {
  const { capsuleId, userId } = job.data;

  // IDOR-safe re-check: hanya kirim ke pemilik yang benar, dan hanya jika sudah waktunya.
  const capsule = await prisma.capsule.findFirst({
    where: { id: capsuleId, userId },
    include: { user: { select: { email: true } } },
  });
  if (!capsule) {
    console.log(`[worker] capsule ${capsuleId} not found (probably deleted) — skip`);
    return;
  }
  if (new Date() < capsule.openAt) {
    console.log(`[worker] capsule ${capsuleId} not yet open — skip (openAt=${capsule.openAt.toISOString()})`);
    return;
  }

  if (capsule.status !== "UNLOCKED") {
    await prisma.capsule.update({ where: { id: capsule.id }, data: { status: "UNLOCKED" } });
  }

  await sendCapsuleOpenedEmail({
    to: capsule.user.email,
    capsuleTitle: capsule.title,
    capsuleId: capsule.id,
    openAt: capsule.openAt,
  });
  console.log(`[worker] notified ${capsule.user.email} for capsule ${capsule.id}`);
}

export function startCapsuleNotificationWorker() {
  const worker = new Worker<CapsuleNotificationJobData>(CAPSULE_QUEUE_NAME, handleJob, {
    connection: getRedisConnection(),
    concurrency: 5,
  });
  worker.on("completed", (job) => console.log(`[worker] completed ${job.id}`));
  worker.on("failed", (job, err) => console.error(`[worker] failed ${job?.id}`, err.message));
  worker.on("error", (err) => console.error("[worker]", err.message));
  return worker;
}

// Standalone entrypoint (`npm run worker`) — tidak jalan saat di-import dari API server.
const isDirectRun = process.argv[1]?.endsWith("capsuleNotification.worker.ts") ?? false;
if (isDirectRun) {
  console.log("[worker] starting capsule-notification-queue worker…");
  startCapsuleNotificationWorker();
  const shutdown = async () => { const { prisma: p } = await import("../config/prisma.js"); await p.$disconnect(); process.exit(0); };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
