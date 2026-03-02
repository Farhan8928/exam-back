import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  password: z.string().min(6).optional(),
  isActive: z.boolean().optional(),
});

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });

      if (req.user!.role === "TEACHER" && parsed.data.role !== "STUDENT") {
        return res.status(403).json({ message: "Teachers can only create student accounts" });
      }

      const result = await userService.createUser(parsed.data, req.user!.id);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }

      res.status(201).json({ user: result.user, generatedPassword: result.generatedPassword });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { role, page, limit, search } = req.query;
      const result = await userService.listUsers(
        role as string | undefined,
        Number(page) || 1,
        Number(limit) || 20,
        search as string | undefined
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await userService.getUser(id);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }
      res.json(result.user);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updateSchema = z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).optional(),
        isActive: z.boolean().optional(),
      });
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });

      const result = await userService.updateUser(id, parsed.data, req.user!.id);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }

      res.json(result.user);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await userService.resetPassword(id, req.user!.id);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }
      res.json({ tempPassword: result.tempPassword });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await userService.deleteUser(id, req.user!.id);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

export const userController = new UserController();
