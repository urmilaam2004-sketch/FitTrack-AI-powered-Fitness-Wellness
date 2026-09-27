import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  activityLevel: { type: String, default: "moderate" },
  fitnessGoal: { type: String, default: "general fitness" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
