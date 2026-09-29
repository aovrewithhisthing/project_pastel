import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middlewares/authenticateToken.js";
import * as attachmentService from "../services/attachment.service.js";

/** POST /api/capsules/:id/attachments/upload-url — butuh Bearer, owner-only */
export async function createUploadUrl(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const result = await attachmentService.createAttachmentUploadUrl(id, req.user!.id, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (e) { next(e); }
}
