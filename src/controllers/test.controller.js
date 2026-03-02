const testService = require("../services/test.service");

class TestController {
  async create(req, res) {
    try {
      const test = await testService.createTest(req.body, req.user._id);
      res.status(201).json(test);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async list(req, res) {
    try {
      const { page, limit } = req.query;
      const result = await testService.listTests({ page: Number(page) || 1, limit: Number(limit) || 20 }, req.user);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getDetail(req, res) {
    try {
      const result = await testService.getTestDetail(req.params.id);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json(result.test);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async update(req, res) {
    try {
      const result = await testService.updateTest(req.params.id, req.body, req.user._id, req.user.role);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json(result.test);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async addQuestions(req, res) {
    try {
      const { questionIds } = req.body;
      if (!questionIds?.length) return res.status(400).json({ message: "No questions provided" });
      const result = await testService.addQuestions(req.params.id, questionIds);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async removeQuestion(req, res) {
    try {
      const result = await testService.removeQuestion(req.params.id, req.params.questionId, req.user._id, req.user.role);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async assign(req, res) {
    try {
      const { studentIds } = req.body;
      if (!studentIds?.length) return res.status(400).json({ message: "No students provided" });
      const result = await testService.assignStudents(req.params.id, studentIds, req.user);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.status(201).json(result.assignments);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getAssignments(req, res) {
    try {
      const result = await testService.getAssignments(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getAttempts(req, res) {
    try {
      const result = await testService.getTestAttempts(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

module.exports = new TestController();
