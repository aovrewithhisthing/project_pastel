import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";
import { env } from "../config/env.js";

const REFRESH_COOKIE = "refreshToken";

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.register(req.body);
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({
      success: true,
      data: { user: result.user, accessToken: result.accessToken },
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body);
    setRefreshCookie(res, result.refreshToken);
    res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  } catch (e) {
    next(e);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const raw = (req.cookies?.[REFRESH_COOKIE] as string | undefined) ?? (req.body?.refreshToken as string | undefined);
    if (!raw) {
      res.status(401).json({ success: false, message: "Refresh token required" });
      return;
    }
    const result = await authService.refresh(raw);
    setRefreshCookie(res, result.refreshToken);
    res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  } catch (e) {
    next(e);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const raw = (req.cookies?.[REFRESH_COOKIE] as string | undefined) ?? (req.body?.refreshToken as string | undefined);
    if (raw) await authService.logout(raw);
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.json({ success: true, message: "Logged out" });
  } catch (e) {
    next(e);
  }
}

export async function me(req: Request & { user?: { id: string; email: string } }, res: Response): Promise<void> {
  res.json({ success: true, data: { user: req.user } });
}
