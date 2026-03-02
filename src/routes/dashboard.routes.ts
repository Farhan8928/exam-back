import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/api/dashboard/stats", authMiddleware, roleMiddleware("ADMIN"), (req, res) => dashboardController.getStats(req, res));
router.get("/api/activity-logs", authMiddleware, roleMiddleware("ADMIN"), (req, res) => dashboardController.getActivityLogs(req, res));
router.get("/api/dashboard/students", authMiddleware, roleMiddleware("ADMIN"), (req, res) => dashboardController.getStudentPerformance(req, res));
router.get("/api/dashboard/teachers", authMiddleware, roleMiddleware("ADMIN"), (req, res) => dashboardController.getTeacherPerformance(req, res));
router.get("/api/dashboard/students/:id", authMiddleware, roleMiddleware("ADMIN"), (req, res) => dashboardController.getStudentDetail(req, res));

export default router;
