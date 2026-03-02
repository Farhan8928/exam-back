const mongoose = require("mongoose");

const testQuestionSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  orderIndex: { type: Number, default: 0 },
});

const testSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, default: null },
  duration: { type: Number, required: true },
  maxAttempts: { type: Number, default: 1 },
  randomize: { type: Boolean, default: false },
  publishRule: { type: String, enum: ["INSTANT", "MANUAL", "SCHEDULED"], default: "INSTANT" },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  status: { type: String, enum: ["DRAFT", "SCHEDULED", "ACTIVE", "EXPIRED"], default: "DRAFT" },
  isDeleted: { type: Boolean, default: false },
  questions: [testQuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Test", testSchema);
