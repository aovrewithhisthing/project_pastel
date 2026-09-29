import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

/**
 * Centralized error handler.
 * - AppError -> explicit status/message (used for 404 IDOR shield).
 * - Prisma P2002/P2025 -> mapped to 409/404.
 * - Otherwise -> 500 (message hidden in production).
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") { res.status(409).json({ success: false, message: "Duplicate entry" }); return; }
    if (err.code === "P2025") { res.status(404).json({ success: false, message: "Record not found" }); return; }
    console.error("[prisma]", err.code, err.message);
    res.status(400).json({ success: false, message: "Database error" });
    return;
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    console.error("[prisma validation]", err.message);
    res.status(400).json({ success: false, message: "Invalid request data" });
    return;
  }
  console.error("[unhandled]", err);
  const isProd = process.env.NODE_ENV === "production";
  const msg = err instanceof Error && !isProd ? err.message : "Internal Server Error";
  res.status(500).json({ success: false, message: msg });
}
