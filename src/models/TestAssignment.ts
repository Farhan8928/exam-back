import mongoose, { Schema, Document } from "mongoose";

export interface ITestAssignment extends Document {
  testId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
  assignedAt: Date;
}

const testAssignmentSchema = new Schema<ITestAssignment>({
  testId: { type: Schema.Types.ObjectId, ref: "Test", required: true },
  studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["ASSIGNED", "IN_PROGRESS", "COMPLETED"], default: "ASSIGNED" },
  assignedAt: { type: Date, default: Date.now },
}, { timestamps: false });

testAssignmentSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const TestAssignment = mongoose.model<ITestAssignment>("TestAssignment", testAssignmentSchema);
