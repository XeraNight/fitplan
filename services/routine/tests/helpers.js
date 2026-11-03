import { Exercise } from "../src/models/Exercise.js";

export const INTERNAL_KEY = "test-internal-key";

// A small catalog for tests: n exercises named "<prefix> 1".."<prefix> n".
export async function seedExercises(n, prefix = "Exercise") {
  const docs = Array.from({ length: n }, (_, i) => ({
    name: `${prefix} ${i + 1}`,
    category: i % 2 ? "Legs" : "Chest",
    primaryMuscle: "Test",
    equipment: "Barbell",
  }));
  return Exercise.insertMany(docs);
}

export const item = (exercise, extra = {}) => ({
  exerciseId: String(exercise._id),
  targetSets: 3,
  repMin: 8,
  repMax: 12,
  restSeconds: 90,
  ...extra,
});
