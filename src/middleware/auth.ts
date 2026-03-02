import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { User } from "../models";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const sessions = new Map<string, { userId: string; expiresAt: number }>();

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSession(userId: string): string {
  const token = generateToken();
  sessions.set(token, { userId, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return token;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  const session = sessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) sessions.delete(token);
    return res.status(401).json({ message: "Session expired" });
  }

  const user = await User.findById(session.userId);
  if (!user || user.isDeleted || !user.isActive) {
    return res.status(401).json({ message: "Account disabled" });
  }

  req.user = user.toJSON();

  if (user.mustChangePassword) {
    const allowedPaths = ["/api/auth/me", "/api/auth/change-password", "/api/auth/logout"];
    if (!allowedPaths.includes(req.path)) {
      return res.status(403).json({ message: "Password change required" });
    }
  }

  next();
}

export function roleMiddleware(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
