require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { connectDB } = require("./config/database");
const User = require("./models/User");
const SchoolDomain = require("./models/SchoolDomain");

async function seed() {
  await connectDB();

  const existingAdmin = await User.findOne({ email: "admin@school.edu" });
  if (existingAdmin) {
    console.log("Seed data already exists. Skipping.");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Admin User",
    email: "admin@school.edu",
    password: hashedPassword,
    role: "ADMIN",
    mustChangePassword: false,
  });

  await User.create({
    name: "Teacher User",
    email: "teacher@school.edu",
    password: hashedPassword,
    role: "TEACHER",
    mustChangePassword: false,
  });

  await User.create({
    name: "Student User",
    email: "student@school.edu",
    password: hashedPassword,
    role: "STUDENT",
    mustChangePassword: false,
  });

  await SchoolDomain.create({ domain: "school.edu" });

  console.log("Seed completed!");
  console.log("Default credentials: admin@school.edu / admin123");
  console.log("                     teacher@school.edu / admin123");
  console.log("                     student@school.edu / admin123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
