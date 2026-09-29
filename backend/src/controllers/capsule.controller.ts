import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middlewares/authenticateToken.js";
import * as capsuleService from "../services/capsule.service.js";

/** POST /api/capsules — authenticated */
export async function createCapsule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await capsuleService.createCapsule(req.user!.id, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (e) { next(e); }
}

/** GET /api/capsules — own capsules, metadata only */
export async function listCapsules(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await capsuleService.listCapsules(req.user!.id);
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

/**
 * GET /api/capsules/:id — detail with server-side time-lock.
 * Response shape: { success, locked, capsule: {...} }
 * Frontend branches on `locked` (no need to inspect dates).
 */
export async function getCapsuleById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const result = await capsuleService.getCapsuleById(id, req.user!.id);
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
}

/** DELETE /api/capsules/:id — owner only */
export async function deleteCapsule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await capsuleService.deleteCapsule(id, req.user!.id);
    res.json({ success: true, message: "Capsule deleted" });
  } catch (e) { next(e); }
}
