import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  workoutName: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: Number, required: true, min: 1 },
  caloriesBurned: { type: Number, default: 0, min: 0 },
  workoutDate: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model("Workout", schema);
