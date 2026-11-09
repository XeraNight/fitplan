import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

// One document per (user, exercise): the heaviest weight ever, used for PR detection (R-4).
const ProgressLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    exerciseId: { type: ObjectId, required: true },
    exerciseName: { type: String, required: true },
    maxWeightKg: { type: Number, required: true },
    maxWeightAt: { type: Date, required: true },
    maxWeightSessionId: { type: ObjectId, required: true },
  },
  { timestamps: true, collection: "progresslogs" },
);

ProgressLogSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });

export const ProgressLog = mongoose.model("ProgressLog", ProgressLogSchema);
