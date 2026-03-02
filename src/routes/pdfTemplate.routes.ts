import { Router } from "express";
import { pdfTemplateController } from "../controllers/pdfTemplate.controller.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/api/pdf-templates", authMiddleware, (req, res) => pdfTemplateController.list(req, res));
router.get("/api/pdf-templates/:id", authMiddleware, (req, res) => pdfTemplateController.getById(req, res));
router.post("/api/pdf-templates", authMiddleware, roleMiddleware("ADMIN", "TEACHER"), (req, res) => pdfTemplateController.create(req, res));
router.delete("/api/pdf-templates/:id", authMiddleware, roleMiddleware("ADMIN", "TEACHER"), (req, res) => pdfTemplateController.remove(req, res));

export default router;
