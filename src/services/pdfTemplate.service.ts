import { PdfTemplate } from "../models/index.js";

const MAX_TEMPLATES = 5;

export class PdfTemplateService {
  async list() {
    const templates = await PdfTemplate.find().sort({ createdAt: -1 });
    return templates.map((t) => t.toJSON());
  }

  async create(name: string, base64: string) {
    const count = await PdfTemplate.countDocuments();
    if (count >= MAX_TEMPLATES) {
      return { error: `Maximum ${MAX_TEMPLATES} templates allowed. Please delete one first.`, status: 400 };
    }
    const template = await PdfTemplate.create({ name, base64 });
    return { template: template.toJSON() };
  }

  async delete(id: string) {
    const existing = await PdfTemplate.findById(id);
    if (!existing) {
      return { error: "Template not found", status: 404 };
    }
    await PdfTemplate.findByIdAndDelete(id);
    return { success: true };
  }

  async getById(id: string) {
    const template = await PdfTemplate.findById(id);
    return template ? template.toJSON() : null;
  }
}

export const pdfTemplateService = new PdfTemplateService();
