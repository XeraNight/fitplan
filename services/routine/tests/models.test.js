import "./setup.js";
import { describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { Exercise } from "../src/models/Exercise.js";
import { WorkoutRoutine } from "../src/models/WorkoutRoutine.js";
import { upsertByName } from "../src/dao/exerciseDao.js";

const item = (order, extra = {}) => ({
  exerciseId: new mongoose.Types.ObjectId(),
  exerciseName: `Exercise ${order}`,
  order,
  targetSets: 3,
  repMin: 8,
  repMax: 12,
  ...extra,
});
const routine = (count, extra = {}) => ({
  userId: "google-user-1",
  name: "Push Day",
  exercises: Array.from({ length: count }, (_, i) => item(i + 1)),
  ...extra,
});

describe("WorkoutRoutine (R-1: 1-15 exercises)", () => {
  it.each([1, 15])("accepts %i exercises", async (count) => {
    await expect(WorkoutRoutine.create(routine(count))).resolves.toBeDefined();
  });

  it.each([0, 16])("rejects %i exercises", async (count) => {
    await expect(WorkoutRoutine.create(routine(count))).rejects.toThrow(
      "ROUTINE_EXERCISE_COUNT_INVALID",
    );
  });

  it("rejects repMin greater than repMax", async () => {
    const doc = routine(1);
    doc.exercises[0] = item(1, { repMin: 12, repMax: 8 });
    await expect(WorkoutRoutine.create(doc)).rejects.toThrow("repMax");
  });

  it("rejects an empty name and a name over 60 characters", async () => {
    await expect(WorkoutRoutine.create(routine(1, { name: "" }))).rejects.toThrow();
    await expect(WorkoutRoutine.create(routine(1, { name: "x".repeat(61) }))).rejects.toThrow();
  });
});

describe("Exercise catalog", () => {
  const squat = {
    name: "Barbell Squat",
    category: "Legs",
    primaryMuscle: "Quadriceps",
    equipment: "Barbell",
  };

  it("rejects an unknown category and bodyweight equipment", async () => {
    await expect(Exercise.create({ ...squat, category: "Cardio" })).rejects.toThrow();
    await expect(Exercise.create({ ...squat, equipment: "Bodyweight" })).rejects.toThrow();
  });

  it("names are unique", async () => {
    await Exercise.create(squat);
    await expect(Exercise.create(squat)).rejects.toThrow(/E11000/);
  });

  it("seed upsert is idempotent: second run updates instead of inserting", async () => {
    expect(await upsertByName(squat)).toBe("inserted");
    expect(await upsertByName({ ...squat, primaryMuscle: "Glutes" })).toBe("updated");
    expect(await Exercise.countDocuments()).toBe(1);
    expect((await Exercise.findOne({ name: squat.name })).primaryMuscle).toBe("Glutes");
  });
});
