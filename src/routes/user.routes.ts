import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth";

const router = Router();

router.post("/api/users", authMiddleware, roleMiddleware("ADMIN", "TEACHER"), (req, res) => userController.create(req, res));
router.get("/api/users", authMiddleware, roleMiddleware("ADMIN", "TEACHER"), (req, res) => userController.list(req, res));
router.get("/api/users/:id", authMiddleware, roleMiddleware("ADMIN"), (req, res) => userController.getUser(req, res));
router.patch("/api/users/:id", authMiddleware, roleMiddleware("ADMIN"), (req, res) => userController.update(req, res));
router.post("/api/users/:id/reset-password", authMiddleware, roleMiddleware("ADMIN"), (req, res) => userController.resetPassword(req, res));
router.delete("/api/users/:id", authMiddleware, roleMiddleware("ADMIN"), (req, res) => userController.deleteUser(req, res));

export default router;
