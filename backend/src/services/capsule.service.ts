import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { AppError } from "../middlewares/errorHandler.js";

/** Body validator for POST /api/capsules */
export const createCapsuleSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  contentText: z.string().trim().max(20000).nullish(),
  openAt: z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), { message: "Invalid openAt date" }),
});

export type CreateCapsuleInput = z.infer<typeof createCapsuleSchema>;

/** Locked envelope: metadata only — contentText & attachments MUST NOT appear here. */
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

/** Unlocked envelope: full payload including contentText + attachments. */
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
      fileKey: string;
      fileName: string;
      fileType: string;
      fileSize: number;
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
  return prisma.capsule.create({
    data: {
      userId,
      title: input.title,
      contentText: input.contentText ?? null,
      openAt: input.openAt,
      status: "LOCKED",
    },
    select: { id: true, title: true, openAt: true, status: true, createdAt: true },
  });
}

/**
 * List own capsules — metadata ONLY.
 * The Prisma `select` deliberately omits `contentText` so a locked
 * capsule body can never leak through this endpoint.
 */
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
 * - Query is ALWAYS scoped `WHERE id AND userId` (non-owner => 404).
 * - If `new Date() < capsule.openAt` => metadata only (locked: true).
 * - Else flip status to UNLOCKED (if needed) and return full payload.
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

  const now = new Date();
  if (now < capsule.openAt) {
    // DILARANG KERAS: never include contentText / attachments below.
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

  return {
    locked: false,
    capsule: {
      id: capsule.id,
      title: capsule.title,
      contentText: capsule.contentText,
      openAt: capsule.openAt,
      status,
      locked: false,
      attachments: capsule.attachments,
      createdAt: capsule.createdAt,
      updatedAt,
    },
  };
}

/** Owner-only delete. Uses atomic deleteMany(id+userId); 0 rows => 404. */
export async function deleteCapsule(capsuleId: string, currentUserId: string): Promise<void> {
  const result = await prisma.capsule.deleteMany({
    where: { id: capsuleId, userId: currentUserId },
  });
  if (result.count === 0) throw new AppError("Capsule not found", 404);
}
