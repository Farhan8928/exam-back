import { Test, TestAssignment, Attempt, Notification, Question } from "../models/index.js";

export class StudentService {
  async getAssignments(studentId: string) {
    const assignments = await TestAssignment.find({ studentId })
      .populate("testId")
      .sort({ assignedAt: -1 });

    return assignments.map((a) => {
      const json = a.toJSON();
      const test = json.testId as any;
      return {
        ...json,
        testId: test?.id || test,
        test: test,
      };
    });
  }

  async startTest(testId: string, studentId: string) {
    const test = await Test.findOne({ _id: testId, isDeleted: false });
    if (!test) return { error: "Test not found", status: 404 };

    if (test.status !== "ACTIVE") {
      return { error: "Test is not active", status: 400 };
    }

    const attemptCount = await Attempt.countDocuments({ studentId, testId });
    if (attemptCount >= test.maxAttempts) {
      return { error: "Maximum attempts reached", status: 400 };
    }

    const attempt = await Attempt.create({ testId, studentId });

    const questionIds = test.questions.map((q) => q.questionId);
    const questionsData = await Question.find({ _id: { $in: questionIds } });
    const questionsMap = new Map(questionsData.map((q) => [q._id.toString(), q]));

    let questionList = test.questions
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((tq) => {
        const q = questionsMap.get(tq.questionId.toString());
        if (!q) return null;
        return {
          id: q._id.toString(),
          questionText: q.questionText,
          options: q.options,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
        };
      })
      .filter(Boolean);

    if (test.randomize) {
      questionList = questionList.sort(() => Math.random() - 0.5);
    }

    return {
      data: {
        attemptId: attempt._id.toString(),
        test: { id: test._id.toString(), title: test.title, duration: test.duration },
        questions: questionList,
      },
    };
  }

  async submitAttempt(attemptId: string, answers: any[], studentId: string) {
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return { error: "Attempt not found", status: 404 };
    if (attempt.studentId.toString() !== studentId) return { error: "Forbidden", status: 403 };
    if (attempt.submittedAt) return { error: "Already submitted", status: 400 };

    const test = await Test.findById(attempt.testId);
    if (!test) return { error: "Test not found", status: 404 };

    const questionIds = test.questions.map((q) => q.questionId);
    const questionsData = await Question.find({ _id: { $in: questionIds } });
    const questionsMap = new Map(questionsData.map((q) => [q._id.toString(), q]));

    let score = 0;
    let totalMarks = 0;
    const answerSnapshots: any[] = [];

    for (const tq of test.questions) {
      const q = questionsMap.get(tq.questionId.toString());
      if (!q) continue;

      totalMarks += q.marks;
      const submitted = answers?.find((a: any) => a.questionId === q._id.toString());
      const selectedAnswer = submitted?.selectedAnswer ?? null;
      const isCorrect = selectedAnswer === q.correctAnswer;
      let marksAwarded = 0;

      if (selectedAnswer !== null) {
        marksAwarded = isCorrect ? q.marks : -(q.negativeMarks);
        score += marksAwarded;
      }

      answerSnapshots.push({
        questionId: q._id.toString(),
        questionText: q.questionText,
        options: q.options,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        marksAwarded,
        isCorrect,
      });
    }

    score = Math.max(0, score);

    attempt.score = score;
    attempt.totalMarks = totalMarks;
    attempt.answers = answerSnapshots;
    attempt.submittedAt = new Date();
    await attempt.save();

    const assignment = await TestAssignment.findOne({ testId: attempt.testId, studentId });
    if (assignment) {
      await TestAssignment.findByIdAndUpdate(assignment._id, { status: "COMPLETED" });
    }

    if (test.publishRule === "INSTANT") {
      await Notification.create({
        userId: studentId,
        title: "Result Published",
        message: `Your score for "${test.title}": ${score}/${totalMarks}`,
        type: "result",
      });
    }

    return { attempt: attempt.toJSON() };
  }

  async getAttempts(studentId: string, testId?: string) {
    const conditions: any = { studentId };
    if (testId) conditions.testId = testId;
    const attempts = await Attempt.find(conditions).sort({ startedAt: -1 });
    return attempts.map((a) => a.toJSON());
  }

  async getAttemptDetail(attemptId: string, studentId: string) {
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return { error: "Not found", status: 404 };
    if (attempt.studentId.toString() !== studentId) return { error: "Forbidden", status: 403 };

    const test = await Test.findById(attempt.testId);
    if (test?.publishRule !== "INSTANT" && !attempt.submittedAt) {
      const json = attempt.toJSON();
      delete json.answers;
      return { attempt: json };
    }

    return { attempt: attempt.toJSON() };
  }
}

export const studentService = new StudentService();
