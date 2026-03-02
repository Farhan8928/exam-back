const express = require("express");
const router = express.Router();
const domainController = require("../controllers/domain.controller");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

router.get("/api/domains", authMiddleware, (req, res) => domainController.list(req, res));
router.post("/api/domains", authMiddleware, roleMiddleware("ADMIN"), (req, res) => domainController.create(req, res));
router.delete("/api/domains/:id", authMiddleware, roleMiddleware("ADMIN"), (req, res) => domainController.remove(req, res));

module.exports = router;
