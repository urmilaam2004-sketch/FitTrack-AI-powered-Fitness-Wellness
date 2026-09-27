import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import workoutRoutes from "./routes/workouts.js";
import trackerRoutes from "./routes/trackers.js";
import aiRoutes from "./routes/ai.js";
import { errorHandler } from "./middleware/error.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.json({ message: "FitTrack API running" }));
app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/trackers", trackerRoutes);
app.use("/api/ai", aiRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`FitTrack API: http://localhost:${PORT}`)))
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
