const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

router.post("/api/users", authMiddleware, roleMiddleware("ADMIN"), (req, res) => userController.create(req, res));
router.get("/api/users", authMiddleware, roleMiddleware("ADMIN", "TEACHER"), (req, res) => userController.list(req, res));
router.get("/api/users/:id", authMiddleware, roleMiddleware("ADMIN"), (req, res) => userController.getUser(req, res));
router.patch("/api/users/:id", authMiddleware, roleMiddleware("ADMIN"), (req, res) => userController.update(req, res));
router.post("/api/users/:id/reset-password", authMiddleware, roleMiddleware("ADMIN"), (req, res) => userController.resetPassword(req, res));
router.delete("/api/users/:id", authMiddleware, roleMiddleware("ADMIN"), (req, res) => userController.deleteUser(req, res));

module.exports = router;
