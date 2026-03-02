import { Request, Response } from "express";
import { notificationService } from "../services/notification.service.js";

export class NotificationController {
  async list(req: Request, res: Response) {
    try {
      const notifs = await notificationService.getUserNotifications(req.user!.id);
      res.json(notifs);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async markRead(req: Request, res: Response) {
    try {
      await notificationService.markRead(req.params.id as string);
      res.json({ message: "Marked as read" });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async markAllRead(req: Request, res: Response) {
    try {
      await notificationService.markAllRead(req.user!.id);
      res.json({ message: "All marked as read" });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

export const notificationController = new NotificationController();
