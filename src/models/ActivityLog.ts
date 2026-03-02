import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  actionType: string;
  performedBy: mongoose.Types.ObjectId;
  targetId: string | null;
  details: string | null;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  actionType: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  targetId: { type: String, default: null },
  details: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

activityLogSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
