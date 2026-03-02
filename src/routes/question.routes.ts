import { Router } from "express";
import { questionController } from "../controllers/question.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth";

const router = Router();

router.post("/api/questions", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => questionController.create(req, res));
router.post("/api/questions/bulk", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => questionController.bulkCreate(req, res));
router.get("/api/questions", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => questionController.list(req, res));
router.patch("/api/questions/:id", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => questionController.update(req, res));
router.delete("/api/questions/:id", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => questionController.remove(req, res));

export default router;
