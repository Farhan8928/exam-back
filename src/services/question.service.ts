import { Question, ActivityLog } from "../models";

export class QuestionService {
  async createQuestion(data: any, teacherId: string) {
    const question = await Question.create({ ...data, createdBy: teacherId });
    await ActivityLog.create({
      actionType: "QUESTION_CREATED",
      performedBy: teacherId,
      targetId: String(question._id),
    });
    return question.toJSON();
  }

  async listQuestions(filters: { page?: number; limit?: number; subject?: string }, user: any) {
    const conditions: any = { isDeleted: false };
    if (user.role === "TEACHER") conditions.createdBy = user.id;
    if (filters.subject) conditions.subject = filters.subject;

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const total = await Question.countDocuments(conditions);
    const questions = await Question.find(conditions)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { questions: questions.map((q) => q.toJSON()), total };
  }

  async updateQuestion(id: string, data: any, teacherId: string) {
    const question = await Question.findOne({ _id: id, isDeleted: false });
    if (!question) return { error: "Not found", status: 404 };
    if (question.createdBy.toString() !== teacherId) return { error: "Forbidden", status: 403 };

    const updated = await Question.findByIdAndUpdate(id, data, { new: true });
    return { question: updated!.toJSON() };
  }

  async bulkCreateQuestions(questionsData: any[], teacherId: string) {
    const records = questionsData.map((q) => ({
      ...q,
      createdBy: teacherId,
    }));
    const created = await Question.insertMany(records);
    await ActivityLog.create({
      actionType: "QUESTION_CREATED",
      performedBy: teacherId,
      targetId: `bulk:${created.length}`,
    });
    return created.map((q) => q.toJSON());
  }

  async deleteQuestion(id: string, teacherId: string) {
    const question = await Question.findOne({ _id: id, isDeleted: false });
    if (!question) return { error: "Not found", status: 404 };
    if (question.createdBy.toString() !== teacherId) return { error: "Forbidden", status: 403 };

    await Question.findByIdAndUpdate(id, { isDeleted: true });
    await ActivityLog.create({
      actionType: "QUESTION_DELETED",
      performedBy: teacherId,
      targetId: String(id),
    });
    return { message: "Deleted" };
  }
}

export const questionService = new QuestionService();
