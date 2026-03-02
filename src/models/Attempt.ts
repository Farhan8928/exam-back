import mongoose, { Schema, Document } from "mongoose";

export interface IAnswerSnapshot {
  questionId: string;
  questionText: string;
  options: string[];
  selectedAnswer: number | null;
  correctAnswer: number;
  marks: number;
  negativeMarks: number;
  marksAwarded: number;
  isCorrect: boolean;
}

export interface IAttempt extends Document {
  testId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  startedAt: Date;
  submittedAt: Date | null;
  score: number | null;
  totalMarks: number | null;
  answers: IAnswerSnapshot[] | null;
}

const answerSnapshotSchema = new Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  selectedAnswer: { type: Number, default: null },
  correctAnswer: { type: Number, required: true },
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  marksAwarded: { type: Number, default: 0 },
  isCorrect: { type: Boolean, default: false },
}, { _id: false });

const attemptSchema = new Schema<IAttempt>({
  testId: { type: Schema.Types.ObjectId, ref: "Test", required: true },
  studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: null },
  score: { type: Number, default: null },
  totalMarks: { type: Number, default: null },
  answers: { type: [answerSnapshotSchema], default: null },
}, { timestamps: false });

attemptSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Attempt = mongoose.model<IAttempt>("Attempt", attemptSchema);
