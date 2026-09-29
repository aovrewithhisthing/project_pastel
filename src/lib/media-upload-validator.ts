/**
 * Chronicle Seal - Media Upload Validator & UI Performance Optimization Helper
 * QA Engineer & Full-Stack Performance Module
 */

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "video/mp4",
  "video/webm",
  "application/pdf",
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
  formattedSize: string;
  estimatedSecondsAt10Mbps: number;
}

/**
 * Validates media file before uploading to avoid wasted network roundtrips to S3
 */
export function validateMediaFile(file: { name: string; size: number; type: string }): ValidationResult {
  const sizeMB = file.size / (1024 * 1024);
  const formattedSize = `${sizeMB.toFixed(1)} MB`;

  if (!file.name || file.name.trim().length === 0) {
    return { valid: false, error: "Nama file tidak boleh kosong", formattedSize, estimatedSecondsAt10Mbps: 0 };
  }

  if (file.size <= 0) {
    return { valid: false, error: "Ukuran file tidak valid (0 bytes)", formattedSize, estimatedSecondsAt10Mbps: 0 };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Ukuran file melebihi batas maksimum 25 MB (Ukuran Anda: ${formattedSize})`,
      formattedSize,
      estimatedSecondsAt10Mbps: 0,
    };
  }

  const isAllowed = ALLOWED_MIME_TYPES.includes(file.type) ||
    file.type.startsWith("image/") ||
    file.type.startsWith("audio/") ||
    file.type.startsWith("video/") ||
    file.type === "application/pdf";

  if (!isAllowed) {
    return {
      valid: false,
      error: `Format file '${file.type || "unknown"}' tidak didukung. Harap unggah foto, audio, video, atau PDF.`,
      formattedSize,
      estimatedSecondsAt10Mbps: 0,
    };
  }

  // 10 Mbps = 1.25 MB/s transfer rate
  const estimatedSeconds = Math.ceil(sizeMB / 1.25);

  return {
    valid: true,
    formattedSize,
    estimatedSecondsAt10Mbps: Math.max(1, estimatedSeconds),
  };
}

/**
 * UI Performance: Verifies if animation tasks execute within standard 60fps frame budget (16.6ms)
 */
export function checkFrameBudget(taskFn: () => void): { durationMs: number; is60FpsCompliant: boolean } {
  const start = performance.now();
  taskFn();
  const durationMs = performance.now() - start;
  // 16.6ms is the frame budget for smooth 60 FPS
  return {
    durationMs,
    is60FpsCompliant: durationMs < 16.6,
  };
}
