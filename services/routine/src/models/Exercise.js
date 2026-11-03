import mongoose from "mongoose";

export const CATEGORIES = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
// No bodyweight: R-2 requires weight > 0 and PRs are weight-based.
export const EQUIPMENT = ["Barbell", "Dumbbell", "Machine", "Cable", "Kettlebell"];

const ExerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    primaryMuscle: { type: String, required: true, trim: true },
    equipment: { type: String, required: true, enum: EQUIPMENT },
  },
  { timestamps: true, collection: "exercises" },
);

ExerciseSchema.index({ category: 1, name: 1 });

export const Exercise = mongoose.model("Exercise", ExerciseSchema);
