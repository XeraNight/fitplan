import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import { badRequest, errorHandler } from "../src/index.js";

const appThrowing = (err) => {
  const app = express();
  app.use(express.json());
  app.post("/", () => {
    throw err;
  });
  app.use(errorHandler);
  return app;
};

describe("errorHandler", () => {
  it("AppError -> its status and code", async () => {
    const res = await request(appThrowing(badRequest("ROUTINE_EXERCISE_COUNT_INVALID", "1-15")))
      .post("/")
      .expect(400);
    expect(res.body).toEqual({
      error: { code: "ROUTINE_EXERCISE_COUNT_INVALID", message: "1-15" },
    });
  });

  it("Mongoose ValidationError -> 400 VALIDATION_FAILED with details", async () => {
    const err = Object.assign(new Error("x"), {
      name: "ValidationError",
      errors: { name: { message: "required" } },
    });
    const res = await request(appThrowing(err)).post("/").expect(400);
    expect(res.body.error).toEqual({
      code: "VALIDATION_FAILED",
      message: "Invalid data",
      details: { name: "required" },
    });
  });

  it("CastError (bad id) -> 404, duplicate key -> 409", async () => {
    await request(appThrowing(Object.assign(new Error(), { name: "CastError" })))
      .post("/")
      .expect(404);
    await request(appThrowing(Object.assign(new Error(), { code: 11000 })))
      .post("/")
      .expect(409);
  });

  it("invalid JSON -> 400 INVALID_JSON", async () => {
    const app = appThrowing(new Error("unused"));
    const res = await request(app).post("/").set("content-type", "application/json").send("{bad");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });

  it("unknown error -> 500 without the stack trace", async () => {
    const original = console.error;
    console.error = () => {};
    const res = await request(appThrowing(new Error("secret detail")))
      .post("/")
      .expect(500);
    console.error = original;
    expect(res.body).toEqual({
      error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
    });
  });
});
