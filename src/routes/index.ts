import type { Express } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import questionRoutes from "./question.routes";
import testRoutes from "./test.routes";
import studentRoutes from "./student.routes";
import notificationRoutes from "./notification.routes";
import dashboardRoutes from "./dashboard.routes";
import domainRoutes from "./domain.routes";
import settingsRoutes from "./settings.routes";
import pdfTemplateRoutes from "./pdfTemplate.routes";

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
