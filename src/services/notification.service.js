const Notification = require("../models/Notification");

class NotificationService {
  async list(userId) {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    return notifications.map((n) => { const o = n.toObject(); o.id = o._id; return o; });
  }

  async markRead(id, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) return { error: "Not found", status: 404 };
    return { success: true };
  }

  async markAllRead(userId) {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }
}

module.exports = new NotificationService();
