const userService = require("../services/user.service");

class UserController {
  async create(req, res) {
    try {
      const { name, email, role, password } = req.body;
      if (!name || !email || !role) return res.status(400).json({ message: "Name, email, and role required" });

      const result = await userService.createUser({ name, email, role, password }, req.user._id);
      if (result.error) return res.status(result.status).json({ message: result.error });

      res.status(201).json({ user: result.user, generatedPassword: result.generatedPassword });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async list(req, res) {
    try {
      const { role, page, limit, search } = req.query;
      const result = await userService.listUsers(role, Number(page) || 1, Number(limit) || 20, search);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async getUser(req, res) {
    try {
      const result = await userService.getUser(req.params.id);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json(result.user);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async update(req, res) {
    try {
      const result = await userService.updateUser(req.params.id, req.body, req.user._id);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json(result.user);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async resetPassword(req, res) {
    try {
      const result = await userService.resetPassword(req.params.id, req.user._id);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json({ tempPassword: result.tempPassword });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async deleteUser(req, res) {
    try {
      const result = await userService.deleteUser(req.params.id, req.user._id);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }
}

module.exports = new UserController();
