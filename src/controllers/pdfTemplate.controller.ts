import type { Request, Response } from "express";
import { pdfTemplateService } from "../services/pdfTemplate.service";

class PdfTemplateController {
  async list(req: Request, res: Response) {
    try {
      const templates = await pdfTemplateService.list();
      const withoutBase64 = templates.map(({ base64, ...rest }: any) => rest);
      res.json(withoutBase64);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const template = await pdfTemplateService.getById(id);
      if (!template) return res.status(404).json({ message: "Template not found" });
      res.json(template);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, base64 } = req.body;
      if (!name || !base64) return res.status(400).json({ message: "Name and base64 image are required" });
      const result = await pdfTemplateService.create(name, base64);
      if ((result as any).error) return res.status((result as any).status!).json({ message: (result as any).error });
      res.status(201).json((result as any).template);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await pdfTemplateService.delete(id);
      if ((result as any).error) return res.status((result as any).status!).json({ message: (result as any).error });
      res.json({ message: "Template deleted" });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

export const pdfTemplateController = new PdfTemplateController();
