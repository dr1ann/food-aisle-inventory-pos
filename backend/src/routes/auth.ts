import { Router } from "express";
import { authMiddleware } from "../middleware/auth.ts";
import * as authController from "../controllers/auth.ts";

const router = Router();

router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getMe);

export default router;
