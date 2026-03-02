const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth");

router.post("/api/auth/login", (req, res) => authController.login(req, res));
router.get("/api/auth/me", authMiddleware, (req, res) => authController.me(req, res));
router.post("/api/auth/logout", authMiddleware, (req, res) => authController.logout(req, res));
router.post("/api/auth/change-password", authMiddleware, (req, res) => authController.changePassword(req, res));

module.exports = router;
