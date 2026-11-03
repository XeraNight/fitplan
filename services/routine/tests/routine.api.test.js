import "./setup.js";
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { INTERNAL_KEY, item, seedExercises } from "./helpers.js";

const app = createApp({ internalKey: INTERNAL_KEY });
const as = (userId) => ({
  get: (url) => request(app).get(url).set("x-internal-key", INTERNAL_KEY).set("x-user-id", userId),
  post: (url) =>
    request(app).post(url).set("x-internal-key", INTERNAL_KEY).set("x-user-id", userId),
  put: (url) => request(app).put(url).set("x-internal-key", INTERNAL_KEY).set("x-user-id", userId),
  del: (url) =>
    request(app).delete(url).set("x-internal-key", INTERNAL_KEY).set("x-user-id", userId),
});
const alex = as("alex");
const tomas = as("tomas");

let exercises;
beforeEach(async () => {
  exercises = await seedExercises(3);
});

describe("Routine API", () => {
  it("CRUD happy path", async () => {
    const created = await alex
      .post("/routines")
      .send({ name: "Push Day", exercises: [item(exercises[0])] })
      .expect(201);
    const id = created.body._id;

    expect((await alex.get("/routines").expect(200)).body).toHaveLength(1);
    expect((await alex.get(`/routines/${id}`).expect(200)).body.name).toBe("Push Day");

    const updated = await alex
      .put(`/routines/${id}`)
      .send({ name: "Push Day A", exercises: exercises.map((e) => item(e)) })
      .expect(200);
    expect(updated.body.exercises).toHaveLength(3);

    await alex.del(`/routines/${id}`).expect(204);
    await alex.get(`/routines/${id}`).expect(404);
  });

  it("R-1 over HTTP: 16 exercises -> 400 with the error code", async () => {
    const many = await seedExercises(16, "Extra");
    const res = await alex
      .post("/routines")
      .send({ name: "Too much", exercises: many.map((e) => item(e)) })
      .expect(400);
    expect(res.body.error.code).toBe("ROUTINE_EXERCISE_COUNT_INVALID");
  });

  it("another user's routine -> 404 for read, update and delete", async () => {
    const { body } = await alex
      .post("/routines")
      .send({ name: "Leg Day", exercises: [item(exercises[1])] })
      .expect(201);
    await tomas.get(`/routines/${body._id}`).expect(404);
    await tomas
      .put(`/routines/${body._id}`)
      .send({ name: "Hacked", exercises: [item(exercises[1])] })
      .expect(404);
    await tomas.del(`/routines/${body._id}`).expect(404);
    expect((await tomas.get("/routines").expect(200)).body).toEqual([]);
  });

  it("malformed id -> 404", async () => {
    await alex.get("/routines/not-an-id").expect(404);
  });

  it("without the internal key -> 401", async () => {
    await request(app).get("/routines").set("x-user-id", "alex").expect(401);
  });

  it("health works without the key", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body).toEqual({ status: "ok", db: "up" });
  });
});
