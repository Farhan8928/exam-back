const dashboardService = require("../services/dashboard.service");

class DashboardController {
  async getStats(req, res) {
    try {
      const stats = await dashboardService.getStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getActivityLogs(req, res) {
    try {
      const { page, limit } = req.query;
      const result = await dashboardService.getActivityLogs(Number(page) || 1, Number(limit) || 50);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

module.exports = new DashboardController();
