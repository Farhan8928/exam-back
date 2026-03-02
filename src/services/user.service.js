const bcrypt = require("bcrypt");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

class UserService {
  async createUser(data, performedBy) {
    const existing = await User.findOne({ email: data.email });
    if (existing) return { error: "Email already exists", status: 409 };

    const rawPassword = data.password || generateTempPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const user = await User.create({
      ...data,
      password: hashedPassword,
      mustChangePassword: true,
    });

    await ActivityLog.create({
      actionType: "USER_CREATED",
      performedBy,
      targetId: String(user._id),
      details: `Created ${user.role}: ${user.name}`,
    });

    return { user: user.toSafe(), generatedPassword: data.password ? undefined : rawPassword };
  }

  async listUsers(role, page = 1, limit = 20, search) {
    const query = { isDeleted: false };
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { users: users.map((u) => { const o = u.toObject(); o.id = o._id; return o; }), total };
  }

  async getUser(id) {
    const user = await User.findById(id);
    if (!user || user.isDeleted) return { error: "User not found", status: 404 };
    return { user: user.toSafe() };
  }

  async updateUser(id, data, performedBy) {
    const allowedFields = ["isActive", "isDeleted", "name", "email", "role"];
    const updates = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) updates[field] = data[field];
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) return { error: "User not found", status: 404 };

    await ActivityLog.create({
      actionType: "USER_UPDATED",
      performedBy,
      targetId: String(id),
      details: JSON.stringify(updates),
    });

    return { user: user.toSafe() };
  }

  async resetPassword(userId, performedBy) {
    const user = await User.findById(userId);
    if (!user || user.isDeleted) return { error: "User not found", status: 404 };

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    user.password = hashedPassword;
    user.mustChangePassword = true;
    await user.save();

    await ActivityLog.create({
      actionType: "PASSWORD_RESET",
      performedBy,
      targetId: String(userId),
      details: `Password reset for ${user.name}`,
    });

    return { tempPassword };
  }

  async deleteUser(id, performedBy) {
    const user = await User.findById(id);
    if (!user) return { error: "User not found", status: 404 };

    user.isDeleted = true;
    user.isActive = false;
    await user.save();

    await ActivityLog.create({
      actionType: "USER_DELETED",
      performedBy,
      targetId: String(id),
      details: `Deleted user: ${user.name}`,
    });

    return { success: true };
  }
}

module.exports = new UserService();
