const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "TEACHER", "STUDENT"], default: "STUDENT", required: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  mustChangePassword: { type: Boolean, default: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.toSafe = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
