import { SchoolDomain } from "../models";

export class DomainService {
  async listDomains() {
    const domains = await SchoolDomain.find().sort({ createdAt: -1 });
    return domains.map((d) => d.toJSON());
  }

  async createDomain(data: { domain: string }) {
    const domain = await SchoolDomain.create(data);
    return domain.toJSON();
  }

  async deleteDomain(id: string) {
    const domain = await SchoolDomain.findById(id);
    if (!domain) return { error: "Domain not found", status: 404 };
    await SchoolDomain.findByIdAndDelete(id);
    return { success: true };
  }
}

export const domainService = new DomainService();
