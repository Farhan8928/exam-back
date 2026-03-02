import mongoose, { Schema, Document } from "mongoose";

export interface ISiteSettings extends Document {
  schoolName: string;
  loginTitle: string;
  loginSubtitle: string;
  sidebarSubtitle: string;
  logoBase64: string | null;
  themePreset: string;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>({
  schoolName: { type: String, default: "NFSkills" },
  loginTitle: { type: String, default: "NFSkills" },
  loginSubtitle: { type: String, default: "School Management & Examination System" },
  sidebarSubtitle: { type: String, default: "School Management" },
  logoBase64: { type: String, default: null },
  themePreset: { type: String, default: "blue" },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: false });

siteSettingsSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SiteSettings = mongoose.model<ISiteSettings>("SiteSettings", siteSettingsSchema);
