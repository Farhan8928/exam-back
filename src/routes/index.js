const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const questionRoutes = require("./question.routes");
const testRoutes = require("./test.routes");
const studentRoutes = require("./student.routes");
const notificationRoutes = require("./notification.routes");
const dashboardRoutes = require("./dashboard.routes");
const domainRoutes = require("./domain.routes");

function registerAllRoutes(app) {
  app.use(authRoutes);
  app.use(userRoutes);
  app.use(questionRoutes);
  app.use(testRoutes);
  app.use(studentRoutes);
  app.use(notificationRoutes);
  app.use(dashboardRoutes);
  app.use(domainRoutes);
}

module.exports = { registerAllRoutes };
