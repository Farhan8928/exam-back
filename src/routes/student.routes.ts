import { Router } from "express";
import { studentController } from "../controllers/student.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth";

const router = Router();

router.get("/api/student/assignments", authMiddleware, roleMiddleware("STUDENT"), (req, res) => studentController.getAssignments(req, res));
router.post("/api/student/tests/:id/start", authMiddleware, roleMiddleware("STUDENT"), (req, res) => studentController.startTest(req, res));
router.post("/api/student/attempts/:id/submit", authMiddleware, roleMiddleware("STUDENT"), (req, res) => studentController.submitAttempt(req, res));
router.get("/api/student/attempts", authMiddleware, roleMiddleware("STUDENT"), (req, res) => studentController.getAttempts(req, res));
router.get("/api/student/attempts/:id", authMiddleware, roleMiddleware("STUDENT"), (req, res) => studentController.getAttemptDetail(req, res));

export default router;
