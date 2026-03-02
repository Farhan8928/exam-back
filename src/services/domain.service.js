const SchoolDomain = require("../models/SchoolDomain");

class DomainService {
  async list() {
    const domains = await SchoolDomain.find({}).sort({ createdAt: -1 });
    return domains.map((d) => { const o = d.toObject(); o.id = o._id; return o; });
  }

  async create(domain) {
    const existing = await SchoolDomain.findOne({ domain });
    if (existing) return { error: "Domain already exists", status: 409 };
    const created = await SchoolDomain.create({ domain });
    const obj = created.toObject();
    obj.id = obj._id;
    return obj;
  }

  async remove(id) {
    const domain = await SchoolDomain.findByIdAndDelete(id);
    if (!domain) return { error: "Not found", status: 404 };
    return { success: true };
  }
}

module.exports = new DomainService();
