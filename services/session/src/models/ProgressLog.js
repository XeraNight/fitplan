import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

// One document per (user, exercise): the best values ever, used for PR detection (R-4).
const ProgressLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    exerciseId: { type: ObjectId, required: true },
    exerciseName: { type: String, required: true },
    maxWeightKg: { type: Number, required: true },
    maxWeightAt: { type: Date, required: true },
    maxWeightSessionId: { type: ObjectId, required: true },
    // null when the baseline set had more than 12 reps (no Epley estimate)
    maxEst1RM: { type: Number, default: null },
    maxEst1RMAt: { type: Date, default: null },
    maxEst1RMSessionId: { type: ObjectId, default: null },
  },
  { timestamps: true, collection: "progresslogs" },
);

ProgressLogSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });

export const ProgressLog = mongoose.model("ProgressLog", ProgressLogSchema);
