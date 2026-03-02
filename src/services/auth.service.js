const bcrypt = require("bcrypt");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const { generateToken } = require("../middleware/auth");

class AuthService {
  async login(email, password) {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) return { error: "Invalid credentials", status: 401 };

    if (user.lockUntil && user.lockUntil > new Date()) {
      return { error: "Account locked. Try again later.", status: 423 };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      return { error: "Invalid credentials", status: 401 };
    }

    if (!user.isActive) return { error: "Account disabled", status: 403 };

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const token = generateToken(user._id);
    return { token, user: user.toSafe() };
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) return { error: "User not found", status: 404 };

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return { error: "Current password is incorrect", status: 400 };

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    return { message: "Password changed successfully" };
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) return { error: "User not found", status: 404 };
    return { user: user.toSafe() };
  }
}

module.exports = new AuthService();
