import { User, Test, Attempt, TestAssignment, ActivityLog } from "../models/index.js";

export class DashboardService {
  async getStats() {
    const totalTeachers = await User.countDocuments({ role: "TEACHER", isDeleted: false });
    const totalStudents = await User.countDocuments({ role: "STUDENT", isDeleted: false });
    const totalTests = await Test.countDocuments({ isDeleted: false });
    const totalAttempts = await Attempt.countDocuments();

    const avgResult = await Attempt.aggregate([
      { $match: { submittedAt: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$score" } } },
    ]);

    return {
      totalTeachers,
      totalStudents,
      totalTests,
      totalAttempts,
      avgScore: Number(avgResult[0]?.avg || 0),
    };
  }

  async getActivityLogs(page = 1, limit = 20) {
    const total = await ActivityLog.countDocuments();
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { logs: logs.map((l) => l.toJSON()), total };
  }

  async getStudentPerformance(period: string) {
    const dateFilter = this.getDateFilter(period);

    const students = await User.find({ role: "STUDENT", isDeleted: false }).select("name email");

    const result = [];
    for (const student of students) {
      const attemptConditions: any = { studentId: student._id };
      if (dateFilter) {
        attemptConditions.startedAt = { $gte: dateFilter.start, $lte: dateFilter.end };
      }

      const attempts = await Attempt.find(attemptConditions);
      const totalAttempts = attempts.length;
      const submitted = attempts.filter((a) => a.submittedAt !== null).length;

      let avgScore = 0;
      let totalScore = 0;
      let totalMarks = 0;
      const submittedAttempts = attempts.filter((a) => a.submittedAt && a.totalMarks && a.totalMarks > 0);
      if (submittedAttempts.length > 0) {
        const percentages = submittedAttempts.map((a) => ((a.score || 0) / (a.totalMarks || 1)) * 100);
        avgScore = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
      }
      for (const a of attempts) {
        totalScore += a.score || 0;
        totalMarks += a.totalMarks || 0;
      }

      const assignmentConditions: any = { studentId: student._id };
      if (dateFilter) {
        assignmentConditions.assignedAt = { $gte: dateFilter.start, $lte: dateFilter.end };
      }
      const totalAssigned = await TestAssignment.countDocuments(assignmentConditions);

      result.push({
        studentId: student._id.toString(),
        studentName: student.name,
        studentEmail: student.email,
        totalAttempts,
        avgScore,
        totalScore,
        totalMarks,
        submitted,
        totalAssigned,
      });
    }

    return result.sort((a, b) => b.totalAttempts - a.totalAttempts);
  }

  async getTeacherPerformance(period: string) {
    const dateFilter = this.getDateFilter(period);

    const teachers = await User.find({ role: "TEACHER", isDeleted: false }).select("name email");

    const result = [];
    for (const teacher of teachers) {
      const testConditions: any = { createdBy: teacher._id, isDeleted: false };
      if (dateFilter) {
        testConditions.createdAt = { $gte: dateFilter.start, $lte: dateFilter.end };
      }

      const totalTests = await Test.countDocuments(testConditions);

      const allTests = await Test.find({ createdBy: teacher._id, isDeleted: false });
      const testIds = allTests.map((t) => t._id);

      const attemptConditions: any = { testId: { $in: testIds } };
      if (dateFilter) {
        attemptConditions.startedAt = { $gte: dateFilter.start, $lte: dateFilter.end };
      }

      const attempts = await Attempt.find(attemptConditions);
      const totalAttempts = attempts.length;
      const submittedAttempts = attempts.filter((a) => a.submittedAt !== null).length;

      let avgStudentScore = 0;
      const submittedWithMarks = attempts.filter((a) => a.submittedAt && a.totalMarks && a.totalMarks > 0);
      if (submittedWithMarks.length > 0) {
        const percentages = submittedWithMarks.map((a) => ((a.score || 0) / (a.totalMarks || 1)) * 100);
        avgStudentScore = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
      }

      const assignmentConditions: any = { testId: { $in: testIds } };
      if (dateFilter) {
        assignmentConditions.assignedAt = { $gte: dateFilter.start, $lte: dateFilter.end };
      }
      const totalAssignments = await TestAssignment.countDocuments(assignmentConditions);

      result.push({
        teacherId: teacher._id.toString(),
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        totalTests,
        totalAttempts,
        submittedAttempts,
        avgStudentScore,
        totalAssignments,
      });
    }

    return result;
  }

  async getStudentDetail(studentId: string, period: string) {
    const dateFilter = this.getDateFilter(period);
    const student = await User.findById(studentId).select("name email");
    if (!student) return { student: null, attempts: [] };

    const conditions: any = { studentId };
    if (dateFilter) {
      conditions.startedAt = { $gte: dateFilter.start, $lte: dateFilter.end };
    }

    const attempts = await Attempt.find(conditions)
      .populate("testId", "title description")
      .sort({ startedAt: -1 });

    const studentAttempts = attempts.map((a) => {
      const json = a.toJSON();
      const test = json.testId as any;
      return {
        attemptId: json.id,
        testId: test?.id || test,
        testTitle: test?.title,
        testDescription: test?.description,
        startedAt: json.startedAt,
        submittedAt: json.submittedAt,
        score: json.score,
        totalMarks: json.totalMarks,
      };
    });

    return {
      student: { id: student._id.toString(), name: student.name, email: student.email },
      attempts: studentAttempts,
    };
  }

  private getDateFilter(period: string): { start: Date; end: Date } | null {
    const now = new Date();
    const end = new Date(now);
    let start: Date;
    switch (period) {
      case "daily":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly":
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case "monthly":
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        break;
      case "yearly":
        start = new Date(now);
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return null;
    }
    return { start, end };
  }
}

export const dashboardService = new DashboardService();
