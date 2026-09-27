import mongoose from "mongoose";

const base = { user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, date: { type: Date, required: true } };

const hydration = new mongoose.Schema({ ...base, waterMl: { type: Number, min: 0 }, targetMl: { type: Number, default: 2500 } }, { timestamps: true });
const sleep = new mongoose.Schema({ ...base, sleepTime: String, wakeTime: String, hours: Number, quality: { type: String, enum: ["poor","fair","good","excellent"], default: "good" } }, { timestamps: true });
const nutrition = new mongoose.Schema({ ...base, meal: { type: String, enum: ["breakfast","lunch","dinner","snack"] }, calories: Number, protein: Number, carbs: Number, fat: Number, description: String }, { timestamps: true });
const activity = new mongoose.Schema({ ...base, steps: Number, distanceKm: Number, activeMinutes: Number, caloriesBurned: Number }, { timestamps: true });
const wellness = new mongoose.Schema({ ...base, mood: { type: String, enum: ["happy","good","neutral","sad","stressed"] }, stress: { type: String, enum: ["low","medium","high"] }, meditationMinutes: Number, note: String }, { timestamps: true });
const goal = new mongoose.Schema({ ...base, waterTarget: Number, stepTarget: Number, workoutMinutesTarget: Number, sleepTarget: Number, meditationTarget: Number }, { timestamps: true });
const habit = new mongoose.Schema({ ...base, habit: String, completed: Boolean }, { timestamps: true });

export const Hydration = mongoose.model("Hydration", hydration);
export const Sleep = mongoose.model("Sleep", sleep);
export const Nutrition = mongoose.model("Nutrition", nutrition);
export const Activity = mongoose.model("Activity", activity);
export const Wellness = mongoose.model("Wellness", wellness);
export const Goal = mongoose.model("Goal", goal);
export const Habit = mongoose.model("Habit", habit);
