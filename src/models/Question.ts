import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  createdBy: mongoose.Types.ObjectId;
  subject: string;
  topic: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  negativeMarks: number;
  isDeleted: boolean;
  createdAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

questionSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Question = mongoose.model<IQuestion>("Question", questionSchema);
