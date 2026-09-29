import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { AppError } from "../middlewares/errorHandler.js";
import { buildFileKey, assertUploadable, createUploadUrl } from "./s3.service.js";

export const uploadUrlSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileType: z.string().trim().min(1).max(127),
  fileSize: z.number().int().positive(),
});

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;

/**
 * Buat presigned PUT URL untuk upload — hanya pemilik kapsul.
 * File belum ditulis ke DB sampai klien menyelesaikan PUT ke S3
 * dan memanggil confirm (atau kita cukup simpan stub di sini dan
 * andalkan S3 event / polling; untuk spesifikasi ini kita simpan row dulu).
 *
 * IDOR: cek (id AND userId).
 */
export async function createAttachmentUploadUrl(
  capsuleId: string,
  currentUserId: string,
  input: UploadUrlInput,
) {
  assertUploadable(input.fileName, input.fileType, input.fileSize);

  const capsule = await prisma.capsule.findFirst({
    where: { id: capsuleId, userId: currentUserId },
    select: { id: true, status: true, openAt: true },
  });
  if (!capsule) throw new AppError("Capsule not found", 404);

  const fileKey = buildFileKey(currentUserId, capsuleId, input.fileName);
  const { uploadUrl, expiresIn } = await createUploadUrl({
    key: fileKey,
    contentType: input.fileType,
    contentLength: input.fileSize,
  });

  // Persist attachment row immediately (privat, hanya dapat dibaca saat UNLOCKED).
  const attachment = await prisma.mediaAttachment.create({
    data: {
      capsuleId: capsule.id,
      fileKey,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
    },
  });

  return {
    attachment: { id: attachment.id, fileKey: attachment.fileKey, fileName: attachment.fileName, fileSize: attachment.fileSize },
    uploadUrl,
    expiresIn,
    // Hint for client: PUT to uploadUrl with header `Content-Type: <fileType>`
  };
}
