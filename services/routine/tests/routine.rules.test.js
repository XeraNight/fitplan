import "./setup.js";
import { describe, expect, it } from "vitest";
import * as routineAbl from "../src/abl/routineAbl.js";
import { item, seedExercises } from "./helpers.js";

const USER = "google-user-1";

describe("routineAbl rules", () => {
  it.each([0, 16])("R-1: %i exercises -> 400 ROUTINE_EXERCISE_COUNT_INVALID", async (count) => {
    const exercises = await seedExercises(16);
    const dto = { name: "Push Day", exercises: exercises.slice(0, count).map((e) => item(e)) };
    await expect(routineAbl.create(USER, dto)).rejects.toMatchObject({
      status: 400,
      code: "ROUTINE_EXERCISE_COUNT_INVALID",
    });
  });

  it.each([1, 15])("R-1: %i exercises -> created", async (count) => {
    const exercises = await seedExercises(15);
    const dto = { name: "Push Day", exercises: exercises.slice(0, count).map((e) => item(e)) };
    const routine = await routineAbl.create(USER, dto);
    expect(routine.exercises).toHaveLength(count);
  });

  it("missing exercises array -> 400 ROUTINE_EXERCISE_COUNT_INVALID", async () => {
    await expect(routineAbl.create(USER, { name: "Push Day" })).rejects.toMatchObject({
      code: "ROUTINE_EXERCISE_COUNT_INVALID",
    });
  });

  it("unknown or malformed exercise id -> 400 ROUTINE_EXERCISE_UNKNOWN", async () => {
    const [bench] = await seedExercises(1);
    const dto = {
      name: "Push Day",
      exercises: [
        item(bench),
        { ...item(bench), exerciseId: "665f1c2e9b1e8a0012345678" },
        { ...item(bench), exerciseId: "nonsense" },
      ],
    };
    await expect(routineAbl.create(USER, dto)).rejects.toMatchObject({
      code: "ROUTINE_EXERCISE_UNKNOWN",
      details: { unknownIds: ["665f1c2e9b1e8a0012345678", "nonsense"] },
    });
  });

  it("repMin greater than repMax -> validation error", async () => {
    const [bench] = await seedExercises(1);
    const dto = { name: "Push Day", exercises: [item(bench, { repMin: 12, repMax: 8 })] };
    await expect(routineAbl.create(USER, dto)).rejects.toMatchObject({ name: "ValidationError" });
  });

  it("fills the exercise name snapshot and the order", async () => {
    const exercises = await seedExercises(2);
    const routine = await routineAbl.create(USER, {
      name: "Push Day",
      exercises: [item(exercises[1]), item(exercises[0])],
    });
    expect(routine.exercises.map((e) => [e.order, e.exerciseName])).toEqual([
      [1, "Exercise 2"],
      [2, "Exercise 1"],
    ]);
  });

  it("ignores a userId sent in the body", async () => {
    const [bench] = await seedExercises(1);
    const routine = await routineAbl.create(USER, {
      name: "Push Day",
      userId: "someone-else",
      exercises: [item(bench)],
    });
    expect(routine.userId).toBe(USER);
  });
});
