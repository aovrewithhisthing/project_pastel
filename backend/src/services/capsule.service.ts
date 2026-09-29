import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { AppError } from "../middlewares/errorHandler.js";
import { createDownloadUrl } from "./s3.service.js";
import { scheduleCapsuleNotification } from "../queues/capsuleNotification.queue.js";

/** Body validator for POST /api/capsules */
export const createCapsuleSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  contentText: z.string().trim().max(20000).nullish(),
  openAt: z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), { message: "Invalid openAt date" }),
});

export type CreateCapsuleInput = z.infer<typeof createCapsuleSchema>;

/** Locked envelope: metadata only — contentText/attachments/URLs MUST NOT appear. */
export interface LockedCapsuleResponse {
  locked: true;
  capsule: {
    id: string;
    title: string;
    openAt: Date;
    status: "LOCKED" | "UNLOCKED";
    locked: true;
    createdAt: Date;
    updatedAt: Date;
  };
}

/** Unlocked envelope: contentText + attachments (masing-masing dengan downloadUrl singkat). */
export interface UnlockedCapsuleResponse {
  locked: false;
  capsule: {
    id: string;
    title: string;
    contentText: string | null;
    openAt: Date;
    status: "LOCKED" | "UNLOCKED";
    locked: false;
    attachments: Array<{
      id: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      downloadUrl: string;
      downloadUrlExpiresIn: number;
      createdAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
  };
}

export async function createCapsule(userId: string, input: CreateCapsuleInput) {
  if (input.openAt.getTime() <= Date.now()) {
    throw new AppError("openAt must be a future date", 422);
  }
  const capsule = await prisma.capsule.create({
    data: {
      userId,
      title: input.title,
      contentText: input.contentText ?? null,
      openAt: input.openAt,
      status: "LOCKED",
    },
    select: { id: true, title: true, openAt: true, status: true, createdAt: true },
  });

  // Jadwalkan job notifikasi pembukaan: delay = openAt - now (best-effort, non-blokir).
  try {
    await scheduleCapsuleNotification(capsule.id, userId, capsule.openAt);
  } catch (e) {
    // Redis down tidak boleh menggagalkan pembuatan kapsul.
    console.error("[queue] failed to schedule notification:", (e as Error).message);
  }

  return capsule;
}

/** List own capsules — metadata ONLY (select tanpa contentText). */
export async function listCapsules(userId: string) {
  const rows = await prisma.capsule.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      openAt: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { attachments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const now = Date.now();
  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    openAt: c.openAt,
    status: c.status,
    locked: c.openAt.getTime() > now,
    attachmentCount: c._count.attachments,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

/**
 * CRITICAL: server-side time-lock + IDOR guard.
 * - Query SELALU `WHERE id AND userId` (non-owner => 404).
 * - `now < openAt` => metadata only. URL download S3 TIDAK BOLEH digenerate.
 * - Else flip UNLOCKED + bouat presigned GET singkat per attachment.
 */
export async function getCapsuleById(
  capsuleId: string,
  currentUserId: string,
): Promise<LockedCapsuleResponse | UnlockedCapsuleResponse> {
  const capsule = await prisma.capsule.findFirst({
    where: { id: capsuleId, userId: currentUserId },
    include: { attachments: true },
  });
  if (!capsule) throw new AppError("Capsule not found", 404);

  if (new Date() < capsule.openAt) {
    // DILARANG KERAS: tanpa contentText / attachments / downloadUrl.
    return {
      locked: true,
      capsule: {
        id: capsule.id,
        title: capsule.title,
        openAt: capsule.openAt,
        status: capsule.status,
        locked: true,
        createdAt: capsule.createdAt,
        updatedAt: capsule.updatedAt,
      },
    };
  }

  let status = capsule.status;
  let updatedAt = capsule.updatedAt;
  if (status !== "UNLOCKED") {
    const updated = await prisma.capsule.update({
      where: { id: capsule.id },
      data: { status: "UNLOCKED" },
      select: { status: true, updatedAt: true },
    });
    status = updated.status;
    updatedAt = updated.updatedAt;
  }

  // HANYA di cabang unlocked: generate presigned GET per file (TTL singkat).
  const attachments = await Promise.all(
    capsule.attachments.map(async (a) => {
      const { downloadUrl, expiresIn } = await createDownloadUrl(a.fileKey);
      return {
        id: a.id,
        fileName: a.fileName,
        fileType: a.fileType,
        fileSize: a.fileSize,
        downloadUrl,
        downloadUrlExpiresIn: expiresIn,
        createdAt: a.createdAt,
      };
    }),
  );

  return {
    locked: false,
    capsule: {
      id: capsule.id,
      title: capsule.title,
      contentText: capsule.contentText,
      openAt: capsule.openAt,
      status,
      locked: false,
      attachments,
      createdAt: capsule.createdAt,
      updatedAt,
    },
  };
}

/** Owner-only delete atomic (deleteMany id+userId); 0 rows => 404. */
export async function deleteCapsule(capsuleId: string, currentUserId: string): Promise<void> {
  const result = await prisma.capsule.deleteMany({
    where: { id: capsuleId, userId: currentUserId },
  });
  if (result.count === 0) throw new AppError("Capsule not found", 404);
}
