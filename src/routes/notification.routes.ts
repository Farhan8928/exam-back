import { Router } from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/api/notifications", authMiddleware, (req, res) => notificationController.list(req, res));
router.patch("/api/notifications/read-all", authMiddleware, (req, res) => notificationController.markAllRead(req, res));
router.patch("/api/notifications/:id/read", authMiddleware, (req, res) => notificationController.markRead(req, res));

export default router;
