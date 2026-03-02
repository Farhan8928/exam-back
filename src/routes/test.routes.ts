import { Router } from "express";
import { testController } from "../controllers/test.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth";

const router = Router();

router.post("/api/tests", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => testController.create(req, res));
router.get("/api/tests", authMiddleware, (req, res) => testController.list(req, res));
router.get("/api/tests/:id", authMiddleware, (req, res) => testController.getDetail(req, res));
router.patch("/api/tests/:id", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => testController.update(req, res));
router.delete("/api/tests/:id", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => testController.delete(req, res));
router.post("/api/tests/:id/questions", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => testController.addQuestions(req, res));
router.delete("/api/tests/:id/questions/:questionId", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => testController.removeQuestion(req, res));
router.post("/api/tests/:id/assign", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => testController.assign(req, res));
router.get("/api/tests/:id/assignments", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => testController.getAssignments(req, res));
router.get("/api/tests/:id/attempts", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => testController.getAttempts(req, res));
router.get("/api/attempts", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => testController.getAllAttempts(req, res));
router.get("/api/attempts/:id", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => testController.getAttemptDetail(req, res));

export default router;
