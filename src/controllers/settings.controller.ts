import type { Request, Response } from "express";
import { settingsService } from "../services/settings.service";

class SettingsController {
  async get(req: Request, res: Response) {
    try {
      const settings = await settingsService.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { schoolName, loginTitle, loginSubtitle, sidebarSubtitle, logoBase64, themePreset } = req.body;

      const validThemes = ["blue", "green", "purple", "orange", "red", "teal"];
      if (themePreset && !validThemes.includes(themePreset)) {
        return res.status(400).json({ message: "Invalid theme preset" });
      }

      const settings = await settingsService.updateSettings(
        { schoolName, loginTitle, loginSubtitle, sidebarSubtitle, logoBase64, themePreset },
        req.user!.id,
      );
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  }
}

export const settingsController = new SettingsController();
