import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { AppError } from "../middlewares/errorHandler.js";

/**
 * Bucket WAJIB privat (Block Public Access = ON, tanpa policy publik).
 * Semua akses file HANYA lewat presigned URL bertempo singkat.
 */

let s3: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3) s3 = new S3Client({ region: env.AWS_REGION });
  return s3;
}

function requireBucket(): string {
  if (!env.s3Enabled) throw new AppError("S3 storage is not configured", 503);
  return env.S3_BUCKET;
}

/** Key layout: capsules/<userId>/<capsuleId>/<uuid>-<sanitizedName> (anti traversal & tabrakan) */
export function buildFileKey(userId: string, capsuleId: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 128) || "file";
  return `capsules/${userId}/${capsuleId}/${randomUUID()}-${safe}`;
}

export const ALLOWED_MIME_PREFIXES = ["image/", "video/", "audio/", "application/pdf"];

export function assertUploadable(fileName: string, fileType: string, fileSize: number): void {
  if (!fileName || fileName.length > 255) throw new AppError("Invalid fileName", 422);
  const okMime =
    fileType.length <= 127 &&
    (ALLOWED_MIME_PREFIXES.some((p) => fileType.startsWith(p)) ||
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(fileType));
  if (!okMime) throw new AppError(`Unsupported fileType: ${fileType}`, 422);
  if (!Number.isInteger(fileSize) || fileSize <= 0 || fileSize > env.S3_MAX_FILE_SIZE) {
    throw new AppError(`fileSize must be 1..${env.S3_MAX_FILE_SIZE} bytes`, 422);
  }
}

/** Presigned PUT — klien upload langsung ke S3 privat. */
export async function createUploadUrl(opts: {
  key: string;
  contentType: string;
  contentLength: number;
}): Promise<{ uploadUrl: string; expiresIn: number }> {
  const bucket = requireBucket();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: opts.key,
    ContentType: opts.contentType,
    ContentLength: opts.contentLength,
  });
  const expiresIn = env.S3_UPLOAD_URL_TTL_SEC;
  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn });
  return { uploadUrl, expiresIn };
}

/** Presigned GET — HANYA dipanggil saat kapsul UNLOCKED. TTL singkat 15–30 mnt. */
export async function createDownloadUrl(key: string): Promise<{ downloadUrl: string; expiresIn: number }> {
  const bucket = requireBucket();
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const expiresIn = env.S3_DOWNLOAD_URL_TTL_SEC;
  const downloadUrl = await getSignedUrl(getS3Client(), command, { expiresIn });
  return { downloadUrl, expiresIn };
}
