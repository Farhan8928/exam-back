import { Notification } from "../models/index.js";

export class NotificationService {
  async getUserNotifications(userId: string) {
    const notifs = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    return notifs.map((n) => n.toJSON());
  }

  async markRead(id: string) {
    await Notification.findByIdAndUpdate(id, { isRead: true });
  }

  async markAllRead(userId: string) {
    await Notification.updateMany({ userId }, { isRead: true });
  }
}

export const notificationService = new NotificationService();
