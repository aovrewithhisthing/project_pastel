import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { validate } from "../middlewares/validate.js";
import { createCapsuleSchema } from "../services/capsule.service.js";
import * as ctrl from "../controllers/capsule.controller.js";

const router = Router();

// All capsule endpoints require a valid Bearer access token.
router.use(authenticateToken);

router.post("/", validate(createCapsuleSchema), ctrl.createCapsule);
router.get("/", ctrl.listCapsules);
router.get("/:id", ctrl.getCapsuleById);
router.delete("/:id", ctrl.deleteCapsule);

export default router;
