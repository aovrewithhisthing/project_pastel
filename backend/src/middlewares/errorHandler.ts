import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  const message = err instanceof Error ? err.message : "Internal Server Error";
  const status = (err as { statusCode?: number })?.statusCode ?? 500;
  res.status(status).json({ success: false, message });
}

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
