import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { validate } from "../middlewares/validate.js";
import { createCapsuleSchema } from "../services/capsule.service.js";
import { uploadUrlSchema } from "../services/attachment.service.js";
import * as capsuleCtrl from "../controllers/capsule.controller.js";
import * as attachmentCtrl from "../controllers/attachment.controller.js";

const router = Router();

// Semua endpoint kapsul butuh Bearer access token yang valid.
router.use(authenticateToken);

router.post("/", validate(createCapsuleSchema), capsuleCtrl.createCapsule);
router.get("/", capsuleCtrl.listCapsules);
router.get("/:id", capsuleCtrl.getCapsuleById);
router.delete("/:id", capsuleCtrl.deleteCapsule);

// S3 presigned upload — owner-only, IDOR-checked di service.
router.post("/:id/attachments/upload-url", validate(uploadUrlSchema), attachmentCtrl.createUploadUrl);

export default router;
