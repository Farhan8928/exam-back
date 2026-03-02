require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");
const { registerAllRoutes } = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

registerAllRoutes(app);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
