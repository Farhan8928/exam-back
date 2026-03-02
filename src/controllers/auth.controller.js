const authService = require("../services/auth.service");

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: "Email and password required" });

      const result = await authService.login(email, password);
      if (result.error) return res.status(result.status).json({ message: result.error });

      res.json({ token: result.token, user: result.user });
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async me(req, res) {
    try {
      const result = await authService.getMe(req.user._id);
      if (result.error) return res.status(result.status).json({ message: result.error });
      res.json(result.user);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) return res.status(400).json({ message: "Both passwords required" });
      if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

      const result = await authService.changePassword(req.user._id, oldPassword, newPassword);
      if (result.error) return res.status(result.status).json({ message: result.error });

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  }

  async logout(req, res) {
    res.json({ message: "Logged out" });
  }
}

module.exports = new AuthController();
