import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI must be set in environment variables");
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}
