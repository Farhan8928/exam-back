const Question = require("../models/Question");

class QuestionService {
  async create(data, userId) {
    const question = await Question.create({ ...data, createdBy: userId });
    const obj = question.toObject();
    obj.id = obj._id;
    return obj;
  }

  async list(userId, userRole, page = 1, limit = 50) {
    const query = { isDeleted: false };
    if (userRole === "TEACHER") query.createdBy = userId;

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      questions: questions.map((q) => { const o = q.toObject(); o.id = o._id; return o; }),
      total,
    };
  }

  async update(id, data) {
    const question = await Question.findByIdAndUpdate(id, data, { new: true });
    if (!question) return { error: "Not found", status: 404 };
    const obj = question.toObject();
    obj.id = obj._id;
    return { question: obj };
  }

  async remove(id) {
    const question = await Question.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!question) return { error: "Not found", status: 404 };
    return { success: true };
  }
}

module.exports = new QuestionService();
