import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, hashToken, verifyRefreshToken } from "../utils/tokens.js";
import { AppError } from "../middlewares/errorHandler.js";

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const loginSchema = registerSchema;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

const PUBLIC_USER = { id: true, email: true, createdAt: true } as const;

export async function register(input: RegisterInput) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new AppError("Email already registered", 409);

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash },
    select: PUBLIC_USER,
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const { token: refreshToken, tokenHash, expiresAt } = signRefreshToken(user.id);
  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

  return { user, accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) throw new AppError("Invalid email or password", 401);

  const ok = await verifyPassword(user.passwordHash, input.password);
  if (!ok) throw new AppError("Invalid email or password", 401);

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const { token: refreshToken, tokenHash, expiresAt } = signRefreshToken(user.id);
  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

  return {
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
    accessToken,
    refreshToken,
  };
}

export async function refresh(rawToken: string) {
  let sub: string;
  try {
    sub = verifyRefreshToken(rawToken).sub;
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const tokenHash = hashToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: PUBLIC_USER } },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== sub) {
    throw new AppError("Invalid refresh token", 401);
  }

  // Rotate: revoke old, issue new pair
  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });

  const accessToken = signAccessToken({ sub: stored.user.id, email: stored.user.email });
  const rotated = signRefreshToken(stored.user.id);
  await prisma.refreshToken.create({
    data: { userId: stored.user.id, tokenHash: rotated.tokenHash, expiresAt: rotated.expiresAt },
  });

  return { user: stored.user, accessToken, refreshToken: rotated.token };
}

export async function logout(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
