import mongoose, { Schema, Document } from "mongoose";

export interface IPdfTemplate extends Document {
  name: string;
  base64: string;
  createdAt: Date;
}

const pdfTemplateSchema = new Schema<IPdfTemplate>({
  name: { type: String, required: true },
  base64: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

pdfTemplateSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const PdfTemplate = mongoose.model<IPdfTemplate>("PdfTemplate", pdfTemplateSchema);
