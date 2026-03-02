import { Test, Question, TestAssignment, Attempt, Notification, User, ActivityLog } from "../models/index.js";

export class TestService {
  async createTest(data: any, teacherId: string) {
    const { questionIds, ...testData } = data;
    const test = await Test.create({ ...testData, createdBy: teacherId, status: "DRAFT" });

    if (questionIds && questionIds.length > 0) {
      const questions = questionIds.map((qid: string, idx: number) => ({
        questionId: qid,
        orderIndex: idx,
      }));
      test.questions = questions;
      await test.save();
    }

    await ActivityLog.create({
      actionType: "TEST_CREATED",
      performedBy: teacherId,
      targetId: String(test._id),
    });
    return test.toJSON();
  }

  async listTests(filters: { page?: number; limit?: number }, user: any) {
    const conditions: any = { isDeleted: false };
    if (user.role === "TEACHER") conditions.createdBy = user.id;

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const total = await Test.countDocuments(conditions);
    const tests = await Test.find(conditions)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const result = tests.map((t) => {
      const json = t.toJSON();
      const creator = json.createdBy as any;
      return {
        ...json,
        createdBy: creator?.id || creator,
        creatorName: creator?.name || "Unknown",
      };
    });

    return { tests: result, total };
  }

  async getTestDetail(id: string) {
    const test = await Test.findOne({ _id: id, isDeleted: false });
    if (!test) return { error: "Not found", status: 404 };

    const questionIds = test.questions.map((q) => q.questionId);
    const questionsData = await Question.find({ _id: { $in: questionIds } });
    const questionsMap = new Map(questionsData.map((q) => [q._id.toString(), q.toJSON()]));

    const testQs = test.questions
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((tq) => {
        const question = questionsMap.get(tq.questionId.toString());
        return question ? { questionId: tq.questionId, orderIndex: tq.orderIndex, question } : null;
      })
      .filter(Boolean);

    const creator = await User.findById(test.createdBy);
    const testJson = test.toJSON();

    return {
      test: {
        ...testJson,
        questions: testQs,
        creatorName: creator?.name || "Unknown",
      },
    };
  }

  async updateTest(id: string, data: any, userId: string, userRole: string) {
    const test = await Test.findOne({ _id: id, isDeleted: false });
    if (!test) return { error: "Not found", status: 404 };
    if (userRole !== "ADMIN" && test.createdBy.toString() !== userId) return { error: "Forbidden", status: 403 };

    if (data.status === "ACTIVE" && test.status === "DRAFT") {
      if (test.questions.length < 10) {
        return { error: "Test must have at least 10 questions to activate", status: 400 };
      }
    }

    const updated = await Test.findByIdAndUpdate(id, data, { new: true });
    return { test: updated!.toJSON() };
  }

  async addQuestions(testId: string, questionIds: string[]) {
    const test = await Test.findById(testId);
    if (!test) return { error: "Test not found", status: 404 };

    const startIdx = test.questions.length;
    const newQuestions = questionIds.map((qid, idx) => ({
      questionId: qid,
      orderIndex: startIdx + idx,
    }));

    test.questions.push(...newQuestions as any);
    await test.save();
    return test.questions;
  }

  async removeQuestion(testId: string, questionId: string, userId: string, userRole: string) {
    const test = await Test.findOne({ _id: testId, isDeleted: false });
    if (!test) return { error: "Test not found", status: 404 };
    if (userRole !== "ADMIN" && test.createdBy.toString() !== userId) return { error: "Forbidden", status: 403 };
    if (test.status !== "DRAFT") return { error: "Can only modify DRAFT tests", status: 400 };

    test.questions = test.questions.filter((q) => q.questionId.toString() !== questionId) as any;
    await test.save();
    return { success: true };
  }

  async assignStudents(testId: string, studentIds: string[], teacher: any) {
    const test = await Test.findOne({ _id: testId, isDeleted: false });
    if (!test) return { error: "Test not found", status: 404 };

    const assignments = [];
    for (const studentId of studentIds) {
      const assignment = await TestAssignment.create({ testId, studentId });
      assignments.push(assignment.toJSON());
      await Notification.create({
        userId: studentId,
        title: "New Test Assigned",
        message: `You have been assigned the test: ${test.title}`,
        type: "assignment",
      });
    }

    if (test.status === "DRAFT") {
      if (test.questions.length < 10) {
        return { error: "Test must have at least 10 questions to activate", status: 400 };
      }
      await Test.findByIdAndUpdate(testId, { status: "ACTIVE" });
    }

    return { assignments };
  }

  async deleteTest(id: string, userId: string, userRole: string) {
    const test = await Test.findOne({ _id: id, isDeleted: false });
    if (!test) return { error: "Test not found", status: 404 };
    if (userRole !== "ADMIN" && test.createdBy.toString() !== userId) return { error: "Forbidden", status: 403 };

    await TestAssignment.deleteMany({ testId: id });
    await Attempt.deleteMany({ testId: id });
    await Test.findByIdAndDelete(id);

    await ActivityLog.create({
      actionType: "TEST_DELETED",
      performedBy: userId,
      targetId: String(id),
      details: `Deleted test: ${test.title}`,
    });
    return { success: true };
  }

  async getAssignments(testId: string) {
    const assignments = await TestAssignment.find({ testId }).populate("studentId", "name email");
    return assignments.map((a) => a.toJSON());
  }

  async getTestAttempts(testId: string) {
    const attempts = await Attempt.find({ testId }).populate("studentId").sort({ startedAt: -1 });
    return attempts.map((a) => {
      const json = a.toJSON();
      const student = json.studentId as any;
      return {
        ...json,
        studentId: student?.id || student,
        student: student,
      };
    });
  }

  async getAllAttempts(filters: { period?: string; studentId?: string; search?: string; teacherId?: string }) {
    const conditions: any = { submittedAt: { $ne: null } };

    if (filters.studentId) {
      conditions.studentId = filters.studentId;
    }

    const dateFilter = this.getDateFilter(filters.period || "all");
    if (dateFilter) {
      conditions.submittedAt = { ...conditions.submittedAt, $gte: dateFilter.start, $lte: dateFilter.end };
    }

    let attempts = await Attempt.find(conditions)
      .populate("studentId", "name email")
      .populate("testId", "title description createdBy")
      .sort({ submittedAt: -1 })
      .limit(500);

    if (filters.teacherId) {
      attempts = attempts.filter((a) => {
        const test = a.testId as any;
        return test && test.createdBy && test.createdBy.toString() === filters.teacherId;
      });
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      attempts = attempts.filter((a) => {
        const student = a.studentId as any;
        return student && student.name && student.name.toLowerCase().includes(searchLower);
      });
    }

    return attempts.map((a) => {
      const json = a.toJSON();
      const student = json.studentId as any;
      const test = json.testId as any;
      return {
        id: json.id,
        testId: test?.id || test,
        studentId: student?.id || student,
        startedAt: json.startedAt,
        submittedAt: json.submittedAt,
        score: json.score,
        totalMarks: json.totalMarks,
        studentName: student?.name,
        studentEmail: student?.email,
        testTitle: test?.title,
        testDescription: test?.description,
      };
    });
  }

  async getAttemptDetail(attemptId: string, userId: string, userRole: string) {
    const attempt = await Attempt.findById(attemptId)
      .populate("studentId", "id name email")
      .populate("testId", "id title description createdBy");
    if (!attempt) return { error: "Attempt not found", status: 404 };

    if (userRole === "TEACHER") {
      const test = attempt.testId as any;
      if (!test || test.createdBy.toString() !== userId) {
        return { error: "Forbidden", status: 403 };
      }
    }

    const json = attempt.toJSON();
    const student = json.studentId as any;
    const test = json.testId as any;
    return {
      attempt: {
        ...json,
        studentId: student?.id || student,
        testId: test?.id || test,
        student: student ? { id: student.id, name: student.name, email: student.email } : undefined,
        test: test ? { id: test.id, title: test.title, description: test.description } : undefined,
      },
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

export const testService = new TestService();
