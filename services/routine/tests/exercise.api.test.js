import "./setup.js";
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { Exercise } from "../src/models/Exercise.js";
import { INTERNAL_KEY } from "./helpers.js";

const app = createApp({ internalKey: INTERNAL_KEY });
const get = (url) =>
  request(app).get(url).set("x-internal-key", INTERNAL_KEY).set("x-user-id", "alex");

beforeEach(async () => {
  await Exercise.insertMany([
    { name: "Barbell Squat", category: "Legs", primaryMuscle: "Quadriceps", equipment: "Barbell" },
    { name: "Leg Press", category: "Legs", primaryMuscle: "Quadriceps", equipment: "Machine" },
    {
      name: "Barbell Bench Press",
      category: "Chest",
      primaryMuscle: "Pectoralis Major",
      equipment: "Barbell",
    },
  ]);
});

describe("Exercise API", () => {
  it("lists the whole catalog", async () => {
    expect((await get("/exercises").expect(200)).body).toHaveLength(3);
  });

  it("filters by category", async () => {
    const names = (await get("/exercises?category=Legs").expect(200)).body.map((e) => e.name);
    expect(names).toEqual(["Barbell Squat", "Leg Press"]);
  });

  it("searches by name, case-insensitive, special characters are safe", async () => {
    expect((await get("/exercises?q=BENCH").expect(200)).body[0].name).toBe("Barbell Bench Press");
    expect((await get("/exercises?q=.*").expect(200)).body).toEqual([]);
  });

  it("detail and unknown id", async () => {
    const [squat] = (await get("/exercises?q=squat")).body;
    expect((await get(`/exercises/${squat._id}`).expect(200)).body.name).toBe("Barbell Squat");
    await get("/exercises/665f1c2e9b1e8a0012345678").expect(404);
  });
});
