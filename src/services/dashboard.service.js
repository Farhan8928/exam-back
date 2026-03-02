const User = require("../models/User");
const Test = require("../models/Test");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
const ActivityLog = require("../models/ActivityLog");

class DashboardService {
  async getStats() {
    const [totalUsers, totalTests, totalQuestions, totalAttempts, activeTests] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      Test.countDocuments({ isDeleted: false }),
      Question.countDocuments({ isDeleted: false }),
      Attempt.countDocuments({}),
      Test.countDocuments({ isDeleted: false, status: "ACTIVE" }),
    ]);

    const teachers = await User.countDocuments({ isDeleted: false, role: "TEACHER" });
    const students = await User.countDocuments({ isDeleted: false, role: "STUDENT" });

    return { totalUsers, teachers, students, totalTests, activeTests, totalQuestions, totalAttempts };
  }

  async getActivityLogs(page = 1, limit = 50) {
    const total = await ActivityLog.countDocuments({});
    const logs = await ActivityLog.find({})
      .populate("performedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      logs: logs.map((l) => {
        const o = l.toObject();
        o.id = o._id;
        if (o.performedBy) {
          o.performedByName = o.performedBy.name;
          o.performedByRole = o.performedBy.role;
          o.performedBy = o.performedBy._id;
        }
        return o;
      }),
      total,
    };
  }
}

module.exports = new DashboardService();
