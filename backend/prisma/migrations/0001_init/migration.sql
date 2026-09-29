-- Enable citext for case-insensitive email
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum
DO $$ BEGIN
  CREATE TYPE "CapsuleStatus" AS ENUM ('"'"'LOCKED'"'"', '"'"'UNLOCKED'"'"');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" CITEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Capsules
CREATE TABLE IF NOT EXISTS "capsules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "content_text" TEXT,
  "open_at" TIMESTAMPTZ NOT NULL,
  "status" "CapsuleStatus" NOT NULL DEFAULT '"'"'LOCKED'"'"',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "capsules_user_id_idx" ON "capsules"("user_id");
CREATE INDEX IF NOT EXISTS "capsules_open_at_idx" ON "capsules"("open_at");
CREATE INDEX IF NOT EXISTS "capsules_user_id_status_idx" ON "capsules"("user_id", "status");

-- Media attachments
CREATE TABLE IF NOT EXISTS "media_attachments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "capsule_id" UUID NOT NULL REFERENCES "capsules"("id") ON DELETE CASCADE,
  "file_key" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "file_type" VARCHAR(127) NOT NULL,
  "file_size" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "media_attachments_capsule_id_idx" ON "media_attachments"("capsule_id");

-- Refresh tokens
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" TEXT NOT NULL UNIQUE,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "revoked_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
