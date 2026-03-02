import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/database";
import { registerAllRoutes } from "./routes";
import { seedDatabase } from "./seed";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

registerAllRoutes(app);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  try {
    await connectDB();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
