import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

      const result = await authService.login(parsed.data.email, parsed.data.password);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async me(req: Request, res: Response) {
    const safeUser = authService.getCurrentUser(req.user!);
    res.json(safeUser);
  }

  async logout(req: Request, res: Response) {
    const token = req.headers.authorization?.slice(7);
    if (token) authService.logout(token);
    res.json({ message: "Logged out" });
  }

  async changePassword(req: Request, res: Response) {
    try {
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });

      const result = await authService.changePassword(req.user!.id, parsed.data.oldPassword, parsed.data.newPassword);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }

      res.json({ message: "Password changed successfully" });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

export const authController = new AuthController();
