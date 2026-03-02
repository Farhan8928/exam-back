import type { Express } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import questionRoutes from "./question.routes.js";
import testRoutes from "./test.routes.js";
import studentRoutes from "./student.routes.js";
import notificationRoutes from "./notification.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import domainRoutes from "./domain.routes.js";
import settingsRoutes from "./settings.routes.js";
import pdfTemplateRoutes from "./pdfTemplate.routes.js";

export function registerAllRoutes(app: Express) {
  app.use(authRoutes);
  app.use(userRoutes);
  app.use(questionRoutes);
  app.use(testRoutes);
  app.use(studentRoutes);
  app.use(notificationRoutes);
  app.use(dashboardRoutes);
  app.use(domainRoutes);
  app.use(settingsRoutes);
  app.use(pdfTemplateRoutes);
}
