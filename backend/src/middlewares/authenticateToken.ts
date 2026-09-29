import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokens.js";

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ success: false, message: "Access token required" });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired access token" });
  }
}
