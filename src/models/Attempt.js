const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  questionText: String,
  options: [String],
  selectedAnswer: Number,
  correctAnswer: Number,
  isCorrect: Boolean,
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: null },
  score: { type: Number, default: null },
  totalMarks: { type: Number, default: null },
  answers: [answerSchema],
});

module.exports = mongoose.model("Attempt", attemptSchema);
