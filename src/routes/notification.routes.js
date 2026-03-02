const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authMiddleware } = require("../middleware/auth");

router.get("/api/notifications", authMiddleware, (req, res) => notificationController.list(req, res));
router.patch("/api/notifications/read-all", authMiddleware, (req, res) => notificationController.markAllRead(req, res));
router.patch("/api/notifications/:id/read", authMiddleware, (req, res) => notificationController.markRead(req, res));

module.exports = router;
