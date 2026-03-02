const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

router.get("/api/dashboard/stats", authMiddleware, roleMiddleware("ADMIN"), (req, res) => dashboardController.getStats(req, res));
router.get("/api/activity-logs", authMiddleware, roleMiddleware("ADMIN"), (req, res) => dashboardController.getActivityLogs(req, res));

module.exports = router;
