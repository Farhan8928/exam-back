import { User, Question, Test, TestAssignment, Attempt, Notification, ActivityLog } from "../models/index.js";
import { hashPassword } from "../middleware/auth.js";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class UserService {
  async createUser(data: any, performedBy: string) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return { error: "Email already exists", status: 409 };
    }

    const rawPassword = data.password || generateTempPassword();
    const hashedPassword = await hashPassword(rawPassword);
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

    const safeUser = user.toJSON();
    delete safeUser.password;
    return { user: safeUser, generatedPassword: data.password ? undefined : rawPassword };
  }

  async listUsers(role?: string, page = 1, limit = 20, search?: string) {
    const conditions: any = { isDeleted: false };
    if (role) conditions.role = role;
    if (search) {
      conditions.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(conditions);
    const users = await User.find(conditions)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const safeUsers = users.map((u) => {
      const j = u.toJSON();
      delete j.password;
      return j;
    });

    return { users: safeUsers, total };
  }

  async getUser(id: string) {
    const user = await User.findById(id);
    if (!user || user.isDeleted) return { error: "User not found", status: 404 };
    const safeUser = user.toJSON();
    delete safeUser.password;
    return { user: safeUser };
  }

  async updateUser(id: string, data: any, performedBy: string) {
    const allowedFields = ["isActive", "isDeleted", "name", "email", "role"] as const;
    const updates: Record<string, any> = {};
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

    const safeUser = user.toJSON();
    delete safeUser.password;
    return { user: safeUser };
  }

  async resetPassword(userId: string, performedBy: string) {
    const user = await User.findById(userId);
    if (!user || user.isDeleted) return { error: "User not found", status: 404 };

    const tempPassword = generateTempPassword();
    const hashedPassword = await hashPassword(tempPassword);
    await User.findByIdAndUpdate(userId, { password: hashedPassword, mustChangePassword: true });

    await ActivityLog.create({
      actionType: "PASSWORD_RESET",
      performedBy,
      targetId: String(userId),
      details: `Password reset for ${user.name}`,
    });

    return { tempPassword };
  }

  async deleteUser(id: string, performedBy: string) {
    const user = await User.findById(id);
    if (!user) return { error: "User not found", status: 404 };

    const userTests = await Test.find({ createdBy: id });
    const testIds = userTests.map((t) => t._id);
    if (testIds.length > 0) {
      await Attempt.deleteMany({ testId: { $in: testIds } });
      await TestAssignment.deleteMany({ testId: { $in: testIds } });
      await Test.deleteMany({ _id: { $in: testIds } });
    }
    await Attempt.deleteMany({ studentId: id });
    await TestAssignment.deleteMany({ studentId: id });
    const userQuestions = await Question.find({ createdBy: id });
    const questionIds = userQuestions.map((q) => q._id);
    if (questionIds.length > 0) {
      await Test.updateMany({}, { $pull: { questions: { questionId: { $in: questionIds } } } });
      await Question.deleteMany({ _id: { $in: questionIds } });
    }
    await Notification.deleteMany({ userId: id });
    await ActivityLog.deleteMany({ performedBy: id });
    await User.findByIdAndDelete(id);

    await ActivityLog.create({
      actionType: "USER_DELETED",
      performedBy,
      targetId: String(id),
      details: `Deleted user: ${user.name}`,
    });

    return { success: true };
  }
}

export const userService = new UserService();
