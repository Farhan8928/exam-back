import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/api/auth/login", (req, res) => authController.login(req, res));
router.get("/api/auth/me", authMiddleware, (req, res) => authController.me(req, res));
router.post("/api/auth/logout", authMiddleware, (req, res) => authController.logout(req, res));
router.post("/api/auth/change-password", authMiddleware, (req, res) => authController.changePassword(req, res));

export default router;
