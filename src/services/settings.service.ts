import { SiteSettings, ActivityLog } from "../models/index.js";

export class SettingsService {
  async getSettings() {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return settings.toJSON();
  }

  async updateSettings(data: {
    schoolName?: string;
    loginTitle?: string;
    loginSubtitle?: string;
    sidebarSubtitle?: string;
    logoBase64?: string | null;
    themePreset?: string;
  }, performedBy: string) {
    let settings = await SiteSettings.findOne();
    if (settings) {
      Object.assign(settings, data, { updatedAt: new Date() });
      await settings.save();
    } else {
      settings = await SiteSettings.create({
        schoolName: data.schoolName || "NFSkills",
        loginTitle: data.loginTitle || "NFSkills",
        loginSubtitle: data.loginSubtitle || "School Management & Examination System",
        sidebarSubtitle: data.sidebarSubtitle || "School Management",
        logoBase64: data.logoBase64 || null,
        themePreset: data.themePreset || "blue",
      });
    }

    await ActivityLog.create({
      actionType: "SETTINGS_UPDATED",
      performedBy,
      details: `Updated site settings: ${Object.keys(data).filter(k => k !== 'logoBase64').join(', ')}`,
    });

    return settings.toJSON();
  }
}

export const settingsService = new SettingsService();
