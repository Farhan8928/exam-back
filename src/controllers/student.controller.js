const studentService = require("../services/student.service");

class StudentController {
  async getAssignments(req, res) {
    try {
      const result = await studentService.getAssignments(req.user._id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async startTest(req, res) {
    try {
      const result = await studentService.startTest(req.params.id, req.user._id);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async submitAttempt(req, res) {
    try {
      const { answers } = req.body;
      const result = await studentService.submitAttempt(req.params.id, answers || [], req.user._id);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getAttempts(req, res) {
    try {
      const result = await studentService.getAttempts(req.user._id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getAttemptDetail(req, res) {
    try {
      const result = await studentService.getAttemptDetail(req.params.id, req.user._id);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

module.exports = new StudentController();
