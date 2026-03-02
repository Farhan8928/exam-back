import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

export class DashboardController {
  async getStats(req: Request, res: Response) {
    try {
      const stats = await dashboardService.getStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getActivityLogs(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;
      const result = await dashboardService.getActivityLogs(Number(page) || 1, Number(limit) || 20);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getStudentPerformance(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "all";
      const data = await dashboardService.getStudentPerformance(period);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getTeacherPerformance(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "all";
      const data = await dashboardService.getTeacherPerformance(period);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getStudentDetail(req: Request, res: Response) {
    try {
      const studentId = req.params.id as string;
      const period = (req.query.period as string) || "all";
      const data = await dashboardService.getStudentDetail(studentId, period);
      if (!data.student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

export const dashboardController = new DashboardController();
