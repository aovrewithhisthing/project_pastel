import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { registerSchema, loginSchema } from "../services/auth.service.js";
import * as ctrl from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), ctrl.register);
router.post("/login", validate(loginSchema), ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);
router.get("/me", authenticateToken, ctrl.me);

export default router;
