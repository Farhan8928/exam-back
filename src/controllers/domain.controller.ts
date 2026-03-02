import { Request, Response } from "express";
import { domainService } from "../services/domain.service";
import { z } from "zod";

const insertDomainSchema = z.object({
  domain: z.string().min(1),
});

export class DomainController {
  async list(req: Request, res: Response) {
    try {
      const domains = await domainService.listDomains();
      res.json(domains);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsed = insertDomainSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });

      const domain = await domainService.createDomain(parsed.data as { domain: string });
      res.status(201).json(domain);
    } catch (err: any) {
      if (err?.code === 11000) {
        return res.status(409).json({ message: "Domain already exists" });
      }
      res.status(500).json({ message: "Internal error" });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await domainService.deleteDomain(id);
      if ("error" in result) {
        return res.status(result.status!).json({ message: result.error });
      }
      res.json({ message: "Domain deleted" });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

export const domainController = new DomainController();
