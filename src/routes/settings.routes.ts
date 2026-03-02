import { Router } from "express";
import { settingsController } from "../controllers/settings.controller.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/api/settings", (req, res) => settingsController.get(req, res));
router.patch("/api/settings", authMiddleware, roleMiddleware("ADMIN", "TEACHER"), (req, res) => settingsController.update(req, res));

export default router;
