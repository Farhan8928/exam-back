const domainService = require("../services/domain.service");

class DomainController {
  async list(req, res) {
    try {
      const result = await domainService.list();
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async create(req, res) {
    try {
      const { domain } = req.body;
      if (!domain) return res.status(400).json({ message: "Domain required" });
      const result = await domainService.create(domain);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async remove(req, res) {
    try {
      const result = await domainService.remove(req.params.id);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json({ message: "Domain deleted" });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

module.exports = new DomainController();
