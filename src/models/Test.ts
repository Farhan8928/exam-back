import mongoose, { Schema, Document } from "mongoose";

export interface ITestQuestion {
  questionId: mongoose.Types.ObjectId;
  orderIndex: number;
}

export interface ITest extends Document {
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description: string | null;
  duration: number;
  maxAttempts: number;
  randomize: boolean;
  publishRule: "INSTANT" | "MANUAL" | "SCHEDULED";
  startDate: Date | null;
  endDate: Date | null;
  status: "DRAFT" | "SCHEDULED" | "ACTIVE" | "EXPIRED";
  isDeleted: boolean;
  questions: ITestQuestion[];
  createdAt: Date;
}

const testQuestionSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  orderIndex: { type: Number, default: 0 },
}, { _id: false });

const testSchema = new Schema<ITest>({
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
  questions: { type: [testQuestionSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

testSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Test = mongoose.model<ITest>("Test", testSchema);
