const Test = require("../models/Test");
const Attempt = require("../models/Attempt");
const TestAssignment = require("../models/TestAssignment");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

class TestService {
  async createTest(data, userId) {
    const { questionIds, ...testData } = data;
    const test = await Test.create({ ...testData, createdBy: userId });

    if (questionIds && questionIds.length > 0) {
      test.questions = questionIds.map((qid, idx) => ({ questionId: qid, orderIndex: idx }));
      await test.save();
    }

    await ActivityLog.create({
      actionType: "TEST_CREATED",
      performedBy: userId,
      targetId: String(test._id),
    });

    const obj = test.toObject();
    obj.id = obj._id;
    return obj;
  }

  async listTests(filters, user) {
    const query = { isDeleted: false };
    if (user.role === "TEACHER") query.createdBy = user._id;

    const total = await Test.countDocuments(query);
    const tests = await Test.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(((filters.page || 1) - 1) * (filters.limit || 20))
      .limit(filters.limit || 20);

    return {
      tests: tests.map((t) => {
        const obj = t.toObject();
        obj.id = obj._id;
        obj.creatorName = obj.createdBy?.name || "Unknown";
        obj.createdBy = obj.createdBy?._id || obj.createdBy;
        return obj;
      }),
      total,
    };
  }

  async getTestDetail(id) {
    const test = await Test.findOne({ _id: id, isDeleted: false })
      .populate("questions.questionId")
      .populate("createdBy", "name");
    if (!test) return { error: "Not found", status: 404 };

    const obj = test.toObject();
    obj.id = obj._id;
    obj.creatorName = obj.createdBy?.name || "Unknown";
    obj.createdBy = obj.createdBy?._id || obj.createdBy;
    obj.questions = (obj.questions || []).map((tq) => ({
      id: tq._id,
      testId: obj._id,
      questionId: tq.questionId?._id || tq.questionId,
      orderIndex: tq.orderIndex,
      question: tq.questionId ? { ...tq.questionId, id: tq.questionId._id } : null,
    }));
    return { test: obj };
  }

  async updateTest(id, data, userId, userRole) {
    const test = await Test.findById(id);
    if (!test) return { error: "Not found", status: 404 };
    if (userRole !== "ADMIN" && String(test.createdBy) !== String(userId)) return { error: "Forbidden", status: 403 };

    if (data.status === "ACTIVE" && test.status === "DRAFT") {
      if (!test.questions || test.questions.length < 10) {
        return { error: "Test must have at least 10 questions to activate", status: 400 };
      }
    }

    Object.assign(test, data);
    await test.save();

    const obj = test.toObject();
    obj.id = obj._id;
    return { test: obj };
  }

  async addQuestions(testId, questionIds) {
    const test = await Test.findById(testId);
    if (!test) return { error: "Test not found", status: 404 };

    const startIdx = test.questions ? test.questions.length : 0;
    const newQuestions = questionIds.map((qid, idx) => ({ questionId: qid, orderIndex: startIdx + idx }));
    test.questions.push(...newQuestions);
    await test.save();
    return newQuestions;
  }

  async removeQuestion(testId, questionId, userId, userRole) {
    const test = await Test.findById(testId);
    if (!test) return { error: "Test not found", status: 404 };
    if (userRole !== "ADMIN" && String(test.createdBy) !== String(userId)) return { error: "Forbidden", status: 403 };
    if (test.status !== "DRAFT") return { error: "Can only modify DRAFT tests", status: 400 };

    test.questions = test.questions.filter((q) => String(q.questionId) !== String(questionId));
    await test.save();
    return { success: true };
  }

  async assignStudents(testId, studentIds, user) {
    const test = await Test.findById(testId);
    if (!test) return { error: "Test not found", status: 404 };

    const assignments = [];
    for (const studentId of studentIds) {
      const assignment = await TestAssignment.create({ testId, studentId });
      assignments.push(assignment);
      await Notification.create({
        userId: studentId,
        title: "New Test Assigned",
        message: `You have been assigned: ${test.title}`,
        type: "assignment",
      });
    }
    return { assignments };
  }

  async getAssignments(testId) {
    const assignments = await TestAssignment.find({ testId }).populate("studentId", "name email role");
    return assignments.map((a) => {
      const obj = a.toObject();
      obj.id = obj._id;
      return obj;
    });
  }

  async getTestAttempts(testId) {
    const attempts = await Attempt.find({ testId }).populate("studentId", "name email");
    return attempts.map((a) => {
      const obj = a.toObject();
      obj.id = obj._id;
      return obj;
    });
  }
}

module.exports = new TestService();
