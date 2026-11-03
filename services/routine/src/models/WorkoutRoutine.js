import mongoose from "mongoose";

export const MIN_EXERCISES = 1;
export const MAX_EXERCISES = 15;

const integer = { validator: Number.isInteger, message: "{PATH} must be a whole number" };

const RoutineItemSchema = new mongoose.Schema(
  {
    exerciseId: { type: mongoose.Schema.Types.ObjectId, required: true },
    exerciseName: { type: String, required: true }, // snapshot of the catalog name
    order: { type: Number, required: true, min: 1, validate: integer },
    targetSets: { type: Number, required: true, min: 1, max: 10, validate: integer },
    repMin: { type: Number, required: true, min: 1, max: 50, validate: integer },
    repMax: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
      validate: [
        integer,
        {
          validator(value) {
            return value >= this.repMin;
          },
          message: "repMax must be greater than or equal to repMin",
        },
      ],
    },
    restSeconds: { type: Number, min: 0, max: 600, validate: integer },
  },
  { _id: false },
);

const WorkoutRoutineSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 60 },
    exercises: {
      type: [RoutineItemSchema],
      // R-1: a routine has 1-15 exercises
      validate: {
        validator: (items) => items.length >= MIN_EXERCISES && items.length <= MAX_EXERCISES,
        message: "ROUTINE_EXERCISE_COUNT_INVALID",
      },
    },
  },
  { timestamps: true, collection: "routines" },
);

export const WorkoutRoutine = mongoose.model("WorkoutRoutine", WorkoutRoutineSchema);
