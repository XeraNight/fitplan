import mongoose from "mongoose";

export const MIN_WEIGHT_KG = 0; // exclusive
export const MAX_WEIGHT_KG = 500; // exclusive
export const SESSION_STATUS = ["active", "completed", "discarded"];

const integer = { validator: Number.isInteger, message: "{PATH} must be a whole number" };
const { ObjectId } = mongoose.Schema.Types;

// Snapshot of one routine exercise at the moment the workout started.
const PlanItemSchema = new mongoose.Schema(
  {
    exerciseId: { type: ObjectId, required: true },
    exerciseName: { type: String, required: true },
    targetSets: { type: Number, required: true },
    repMin: { type: Number, required: true },
    repMax: { type: Number, required: true },
    restSeconds: { type: Number },
  },
  { _id: false },
);

const LoggedSetSchema = new mongoose.Schema({
  exerciseId: { type: ObjectId, required: true },
  exerciseName: { type: String, required: true },
  setNumber: { type: Number, required: true, min: 1, validate: integer },
  weightKg: {
    type: Number,
    required: true,
    // R-2: 0 < weight < 500, whole kg. Mongoose min/max are inclusive, so the rule is written out.
    validate: [
      { validator: Number.isInteger, message: "SET_WEIGHT_NOT_WHOLE_KG" },
      {
        validator: (w) => w > MIN_WEIGHT_KG && w < MAX_WEIGHT_KG,
        message: "SET_WEIGHT_OUT_OF_RANGE",
      },
    ],
  },
  reps: { type: Number, required: true, min: 1, max: 100, validate: integer },
  isPR: { type: Boolean, default: false },
  loggedAt: { type: Date, default: Date.now },
});

const WorkoutSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    routineId: { type: ObjectId, required: true },
    routineName: { type: String, required: true },
    plan: { type: [PlanItemSchema], default: [] },
    status: { type: String, enum: SESSION_STATUS, default: "active" },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },
    sets: { type: [LoggedSetSchema], default: [] },
    totalVolumeKg: { type: Number, default: 0 },
    durationSec: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "sessions" },
);

// History: the user's sessions by status, newest first.
WorkoutSessionSchema.index({ userId: 1, status: 1, startTime: -1 });
// R-3: at most one active workout per user. MongoDB rejects a second one with E11000.
WorkoutSessionSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
    name: "one_active_session_per_user",
  },
);
// Analytics: sessions of a user that contain a given exercise.
WorkoutSessionSchema.index({ userId: 1, "sets.exerciseId": 1 });

export const WorkoutSession = mongoose.model("WorkoutSession", WorkoutSessionSchema);
