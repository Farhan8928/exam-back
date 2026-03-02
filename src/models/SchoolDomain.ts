import mongoose, { Schema, Document } from "mongoose";

export interface ISchoolDomain extends Document {
  domain: string;
  createdAt: Date;
}

const schoolDomainSchema = new Schema<ISchoolDomain>({
  domain: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

schoolDomainSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SchoolDomain = mongoose.model<ISchoolDomain>("SchoolDomain", schoolDomainSchema);
