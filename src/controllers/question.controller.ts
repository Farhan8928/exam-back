import { Request, Response } from "express";
import { questionService } from "../services/question.service.js";
import { z } from "zod";

const insertQuestionSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  questionText: z.string().min(1),
  options: z.array(z.string()).min(2),
  correctAnswer: z.number().min(0),
  marks: z.number().min(0).optional(),
  negativeMarks: z.number().min(0).optional(),
});

export class QuestionController {
  async create(req: Request, res: Response) {
    try {
      const parsed = insertQuestionSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });

      const question = await questionService.createQuestion(parsed.data, req.user!.id);
      res.status(201).json(question);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async bulkCreate(req: Request, res: Response) {
    try {
      const { questions: questionsData } = req.body;
      if (!Array.isArray(questionsData) || questionsData.length === 0) {
        return res.status(400).json({ message: "No questions provided" });
      }
      if (questionsData.length > 500) {
        return res.status(400).json({ message: "Maximum 500 questions per bulk upload" });
      }
      for (let i = 0; i < questionsData.length; i++) {
        const q = questionsData[i];
        const parsed = insertQuestionSchema.safeParse(q);
        if (!parsed.success) {
          return res.status(400).json({
            message: `Invalid question at position ${i + 1}`,
            errors: parsed.error.errors,
          });
        }
        const opts = parsed.data.options as string[];
        if (!Array.isArray(opts) || opts.length !== 4 || opts.some((o: string) => !o || !o.trim())) {
          return res.status(400).json({
            message: `Question at position ${i + 1} must have exactly 4 non-empty options`,
          });
        }
        questionsData[i] = parsed.data;
      }
      const created = await questionService.bulkCreateQuestions(questionsData, req.user!.id);
      res.status(201).json({ questions: created, count: created.length });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { page, limit, subject } = req.query;
      const result = await questionService.listQuestions(
        { page: Number(page) || 1, limit: Number(limit) || 20, subject: subject as string | undefined },
        req.user!
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await questionService.updateQuestion(id, req.body, req.user!.id);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }

      res.json(result.question);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await questionService.deleteQuestion(id, req.user!.id);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

export const questionController = new QuestionController();
