import { Request, Response } from "express";
import { testService } from "../services/test.service";
import { z } from "zod";

const insertTestSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  duration: z.number().min(1),
  maxAttempts: z.number().min(1).optional(),
  randomize: z.boolean().optional(),
  publishRule: z.enum(["INSTANT", "MANUAL", "SCHEDULED"]).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export class TestController {
  async create(req: Request, res: Response) {
    try {
      const { questionIds, ...testData } = req.body;
      const parsed = insertTestSchema.safeParse(testData);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });

      const test = await testService.createTest({ ...parsed.data, questionIds }, req.user!.id);
      res.status(201).json(test);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;
      const result = await testService.listTests(
        { page: Number(page) || 1, limit: Number(limit) || 20 },
        req.user!
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getDetail(req: Request, res: Response) {
    try {
      const result = await testService.getTestDetail(req.params.id as string);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }

      res.json(result.test);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await testService.updateTest(id, req.body, req.user!.id, req.user!.role);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }

      res.json(result.test);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await testService.deleteTest(id, req.user!.id, req.user!.role);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async addQuestions(req: Request, res: Response) {
    try {
      const testId = req.params.id as string;
      const { questionIds } = req.body;
      if (!questionIds?.length) return res.status(400).json({ message: "No questions provided" });

      const result = await testService.addQuestions(testId, questionIds);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async removeQuestion(req: Request, res: Response) {
    try {
      const testId = req.params.id as string;
      const questionId = req.params.questionId as string;
      const result = await testService.removeQuestion(testId, questionId, req.user!.id, req.user!.role);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async assign(req: Request, res: Response) {
    try {
      const testId = req.params.id as string;
      const { studentIds } = req.body;
      if (!studentIds?.length) return res.status(400).json({ message: "No students provided" });

      const result = await testService.assignStudents(testId, studentIds, req.user!);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }

      res.status(201).json(result.assignments);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getAssignments(req: Request, res: Response) {
    try {
      const assignments = await testService.getAssignments(req.params.id as string);
      res.json(assignments);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getAttempts(req: Request, res: Response) {
    try {
      const testAttempts = await testService.getTestAttempts(req.params.id as string);
      res.json(testAttempts);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getAllAttempts(req: Request, res: Response) {
    try {
      const { period, studentId, search } = req.query;
      const teacherId = req.user!.role === "TEACHER" ? req.user!.id : undefined;
      const result = await testService.getAllAttempts({
        period: (period as string) || "all",
        studentId: studentId as string | undefined,
        search: search as string,
        teacherId,
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getAttemptDetail(req: Request, res: Response) {
    try {
      const attemptId = req.params.id as string;
      const result = await testService.getAttemptDetail(attemptId, req.user!.id, req.user!.role);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }
      res.json(result.attempt);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

export const testController = new TestController();
