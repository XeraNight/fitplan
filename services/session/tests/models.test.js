import "./setup.js";
import { describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { WorkoutSession } from "../src/models/WorkoutSession.js";
import { ProgressLog } from "../src/models/ProgressLog.js";

const id = () => new mongoose.Types.ObjectId();
const session = (extra = {}) => ({
  userId: "google-user-1",
  routineId: id(),
  routineName: "Push Day",
  ...extra,
});
const set = (weightKg) => ({
  exerciseId: id(),
  exerciseName: "Barbell Bench Press",
  setNumber: 1,
  weightKg,
  reps: 8,
});

describe("LoggedSet (R-2: 0 < weight < 500, whole kg)", () => {
  it.each([1, 499])("accepts %i kg", async (weightKg) => {
    await expect(WorkoutSession.create(session({ sets: [set(weightKg)] }))).resolves.toBeDefined();
  });

  it.each([0, 500, 999])("rejects %i kg as out of range", async (weightKg) => {
    await expect(WorkoutSession.create(session({ sets: [set(weightKg)] }))).rejects.toThrow(
      "SET_WEIGHT_OUT_OF_RANGE",
    );
  });

  it("rejects 82.5 kg as not a whole kg", async () => {
    await expect(WorkoutSession.create(session({ sets: [set(82.5)] }))).rejects.toThrow(
      "SET_WEIGHT_NOT_WHOLE_KG",
    );
  });
});

describe("WorkoutSession (R-3: one active workout per user)", () => {
  it("rejects a second active session of the same user", async () => {
    await WorkoutSession.create(session());
    await expect(WorkoutSession.create(session())).rejects.toThrow(/E11000/);
  });

  it("two simultaneous starts: exactly one succeeds", async () => {
    const results = await Promise.allSettled([
      WorkoutSession.create(session()),
      WorkoutSession.create(session()),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  });

  it("allows a new active session after the old one is completed or discarded", async () => {
    await WorkoutSession.create(session({ status: "completed" }));
    await WorkoutSession.create(session({ status: "discarded" }));
    await expect(WorkoutSession.create(session())).resolves.toBeDefined();
  });

  it("other users are not affected", async () => {
    await WorkoutSession.create(session());
    await expect(
      WorkoutSession.create(session({ userId: "google-user-2" })),
    ).resolves.toBeDefined();
  });
});

describe("ProgressLog", () => {
  const log = (exerciseId) => ({
    userId: "google-user-1",
    exerciseId,
    exerciseName: "Barbell Bench Press",
    maxWeightKg: 80,
    maxWeightAt: new Date(),
    maxWeightSessionId: id(),
  });

  it("only one record per (user, exercise)", async () => {
    const exerciseId = id();
    await ProgressLog.create(log(exerciseId));
    await expect(ProgressLog.create(log(exerciseId))).rejects.toThrow(/E11000/);
    await expect(ProgressLog.create(log(id()))).resolves.toBeDefined();
  });
});
