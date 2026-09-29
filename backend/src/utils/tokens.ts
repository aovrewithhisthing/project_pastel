import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

const ACCESS_SECRET: Secret = env.JWT_ACCESS_SECRET;
const REFRESH_SECRET: Secret = env.JWT_REFRESH_SECRET;

export function signAccessToken(payload: AccessTokenPayload): string {
  const opts: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, ACCESS_SECRET, opts);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(userId: string): { token: string; tokenHash: string; expiresAt: Date } {
  const opts: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] };
  const token = jwt.sign({ sub: userId, typ: "refresh" }, REFRESH_SECRET, opts);
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = new Date(((decoded?.exp ?? Date.now() / 1000 + 604800) as number) * 1000);
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash, expiresAt };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET) as { sub: string };
}
