const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  actionType: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetId: { type: String, default: null },
  details: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
