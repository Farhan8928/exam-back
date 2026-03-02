const express = require("express");
const router = express.Router();
const questionController = require("../controllers/question.controller");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

router.post("/api/questions", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => questionController.create(req, res));
router.get("/api/questions", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => questionController.list(req, res));
router.patch("/api/questions/:id", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => questionController.update(req, res));
router.delete("/api/questions/:id", authMiddleware, roleMiddleware("TEACHER", "ADMIN"), (req, res) => questionController.remove(req, res));

module.exports = router;
