import dotenv from "dotenv";
dotenv.config();

function requireEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optionalEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_ACCESS_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",

  // --- S3 (bucket PRIVAT, akses hanya via presigned URL) ---
  AWS_REGION: optionalEnv("AWS_REGION", "ap-southeast-1"),
  S3_BUCKET: optionalEnv("S3_BUCKET", ""),
  S3_UPLOAD_URL_TTL_SEC: Number(process.env.S3_UPLOAD_URL_TTL_SEC ?? 900),   // 15 mnt
  S3_DOWNLOAD_URL_TTL_SEC: Number(process.env.S3_DOWNLOAD_URL_TTL_SEC ?? 1200), // 20 mnt
  S3_MAX_FILE_SIZE: Number(process.env.S3_MAX_FILE_SIZE ?? 104857600), // 100 MB

  // --- Redis / BullMQ ---
  REDIS_URL: optionalEnv("REDIS_URL", "redis://localhost:6379"),

  // --- Mail (Nodemailer SMTP; kosong = log-only di dev) ---
  SMTP_HOST: optionalEnv("SMTP_HOST", ""),
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_USER: optionalEnv("SMTP_USER", ""),
  SMTP_PASS: optionalEnv("SMTP_PASS", ""),
  MAIL_FROM: optionalEnv("MAIL_FROM", "Time Capsule <no-reply@timecapsule.local>"),

  isProd: process.env.NODE_ENV === "production",
  get s3Enabled(): boolean { return this.S3_BUCKET.length > 0; },
  get mailEnabled(): boolean { return this.SMTP_HOST.length > 0; },
};
