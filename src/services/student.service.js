const Test = require("../models/Test");
const Attempt = require("../models/Attempt");
const TestAssignment = require("../models/TestAssignment");
const Question = require("../models/Question");

class StudentService {
  async getAssignments(studentId) {
    const assignments = await TestAssignment.find({ studentId }).populate("testId");
    return assignments.map((a) => {
      const obj = a.toObject();
      obj.id = obj._id;
      if (obj.testId) {
        obj.test = { ...obj.testId, id: obj.testId._id };
        delete obj.test.questions;
      }
      obj.testId = obj.testId?._id || obj.testId;
      return obj;
    });
  }

  async startTest(testId, studentId) {
    const test = await Test.findById(testId).populate("questions.questionId");
    if (!test) return { error: "Test not found", status: 404 };
    if (test.status !== "ACTIVE") return { error: "Test is not active", status: 400 };

    const assignment = await TestAssignment.findOne({ testId, studentId });
    if (!assignment) return { error: "Not assigned to this test", status: 403 };

    const attemptCount = await Attempt.countDocuments({ testId, studentId });
    if (attemptCount >= test.maxAttempts) return { error: "Maximum attempts reached", status: 400 };

    if (assignment.status === "ASSIGNED") {
      assignment.status = "IN_PROGRESS";
      await assignment.save();
    }

    const attempt = await Attempt.create({ testId, studentId });

    let questions = test.questions.map((tq) => ({
      id: tq.questionId._id,
      questionText: tq.questionId.questionText,
      options: tq.questionId.options,
      marks: tq.questionId.marks,
      negativeMarks: tq.questionId.negativeMarks,
    }));

    if (test.randomize) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    return {
      attempt: { id: attempt._id, testId, startedAt: attempt.startedAt },
      test: { id: test._id, title: test.title, duration: test.duration },
      questions,
    };
  }

  async submitAttempt(attemptId, answers, studentId) {
    const attempt = await Attempt.findOne({ _id: attemptId, studentId });
    if (!attempt) return { error: "Attempt not found", status: 404 };
    if (attempt.submittedAt) return { error: "Already submitted", status: 400 };

    const test = await Test.findById(attempt.testId).populate("questions.questionId");
    const questionMap = {};
    for (const tq of test.questions) {
      if (tq.questionId) questionMap[String(tq.questionId._id)] = tq.questionId;
    }

    let score = 0;
    let totalMarks = 0;
    const answerSnapshots = [];

    for (const ans of answers) {
      const question = questionMap[String(ans.questionId)];
      if (!question) continue;

      totalMarks += question.marks;
      const isCorrect = ans.selectedAnswer === question.correctAnswer;
      if (isCorrect) {
        score += question.marks;
      } else if (ans.selectedAnswer !== null && ans.selectedAnswer !== undefined) {
        score -= question.negativeMarks;
      }

      answerSnapshots.push({
        questionId: question._id,
        questionText: question.questionText,
        options: question.options,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
      });
    }

    attempt.submittedAt = new Date();
    attempt.score = Math.max(0, score);
    attempt.totalMarks = totalMarks;
    attempt.answers = answerSnapshots;
    await attempt.save();

    const assignment = await TestAssignment.findOne({ testId: attempt.testId, studentId });
    if (assignment) {
      assignment.status = "COMPLETED";
      await assignment.save();
    }

    const result = attempt.toObject();
    result.id = result._id;
    if (test.publishRule !== "INSTANT") {
      result.answers = result.answers.map((a) => {
        const { correctAnswer, isCorrect, ...rest } = a;
        return rest;
      });
      result.score = undefined;
    }
    return result;
  }

  async getAttempts(studentId) {
    const attempts = await Attempt.find({ studentId }).populate("testId", "title publishRule").sort({ startedAt: -1 });
    return attempts.map((a) => {
      const obj = a.toObject();
      obj.id = obj._id;
      if (obj.testId) {
        obj.test = { id: obj.testId._id, title: obj.testId.title, publishRule: obj.testId.publishRule };
      }
      return obj;
    });
  }

  async getAttemptDetail(attemptId, studentId) {
    const attempt = await Attempt.findOne({ _id: attemptId, studentId }).populate("testId", "title publishRule");
    if (!attempt) return { error: "Not found", status: 404 };

    const obj = attempt.toObject();
    obj.id = obj._id;
    if (obj.testId) {
      obj.test = { id: obj.testId._id, title: obj.testId.title, publishRule: obj.testId.publishRule };
    }
    return obj;
  }
}

module.exports = new StudentService();
