const notificationService = require("../services/notification.service");

class NotificationController {
  async list(req, res) {
    try {
      const result = await notificationService.list(req.user._id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async markRead(req, res) {
    try {
      const result = await notificationService.markRead(req.params.id, req.user._id);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async markAllRead(req, res) {
    try {
      const result = await notificationService.markAllRead(req.user._id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

module.exports = new NotificationController();
