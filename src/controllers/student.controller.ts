import { Request, Response } from "express";
import { studentService } from "../services/student.service";

export class StudentController {
  async getAssignments(req: Request, res: Response) {
    try {
      const assignments = await studentService.getAssignments(req.user!.id);
      res.json(assignments);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async startTest(req: Request, res: Response) {
    try {
      const testId = req.params.id as string;
      const result = await studentService.startTest(testId, req.user!.id);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }

      res.json(result.data);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async submitAttempt(req: Request, res: Response) {
    try {
      const attemptId = req.params.id as string;
      const { answers } = req.body;
      const result = await studentService.submitAttempt(attemptId, answers, req.user!.id);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }

      res.json(result.attempt);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getAttempts(req: Request, res: Response) {
    try {
      const { testId } = req.query;
      const studentAttempts = await studentService.getAttempts(req.user!.id, testId as string | undefined);
      res.json(studentAttempts);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getAttemptDetail(req: Request, res: Response) {
    try {
      const result = await studentService.getAttemptDetail(req.params.id as string, req.user!.id);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }

      res.json(result.attempt);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

export const studentController = new StudentController();
