import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  isActive: boolean;
  isDeleted: boolean;
  mustChangePassword: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "TEACHER", "STUDENT"], default: "STUDENT" },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  mustChangePassword: { type: Boolean, default: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>("User", userSchema);
