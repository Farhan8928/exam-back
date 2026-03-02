import { Router } from "express";
import { domainController } from "../controllers/domain.controller.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/api/domains", authMiddleware, (req, res) => domainController.list(req, res));
router.post("/api/domains", authMiddleware, roleMiddleware("ADMIN", "TEACHER"), (req, res) => domainController.create(req, res));
router.delete("/api/domains/:id", authMiddleware, roleMiddleware("ADMIN", "TEACHER"), (req, res) => domainController.remove(req, res));

export default router;
