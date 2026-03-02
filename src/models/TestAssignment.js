const mongoose = require("mongoose");

const testAssignmentSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["ASSIGNED", "IN_PROGRESS", "COMPLETED"], default: "ASSIGNED" },
  assignedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TestAssignment", testAssignmentSchema);
