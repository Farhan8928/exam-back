const questionService = require("../services/question.service");

class QuestionController {
  async create(req, res) {
    try {
      const result = await questionService.create(req.body, req.user._id);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async list(req, res) {
    try {
      const { page, limit } = req.query;
      const result = await questionService.list(req.user._id, req.user.role, Number(page) || 1, Number(limit) || 50);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async update(req, res) {
    try {
      const result = await questionService.update(req.params.id, req.body);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json(result.question);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async remove(req, res) {
    try {
      const result = await questionService.remove(req.params.id);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json({ message: "Question deleted" });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

module.exports = new QuestionController();
