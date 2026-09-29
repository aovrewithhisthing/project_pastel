import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middlewares/authenticateToken.js";
import * as capsuleService from "../services/capsule.service.js";

export async function createCapsule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await capsuleService.createCapsule(req.user!.id, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function listCapsules(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await capsuleService.listCapsules(req.user!.id);
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function getCapsuleById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const result = await capsuleService.getCapsuleById(id, req.user!.id);
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
}

export async function deleteCapsule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await capsuleService.deleteCapsule(id, req.user!.id);
    res.json({ success: true, message: "Capsule deleted" });
  } catch (e) { next(e); }
}
