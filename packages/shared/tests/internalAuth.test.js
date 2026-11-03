import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import { errorHandler, internalAuth } from "../src/index.js";

const app = express();
app.use(internalAuth({ key: "test-key" }));
app.get("/", (req, res) => res.json({ userId: req.userId }));
app.use(errorHandler);

describe("internalAuth", () => {
  it("missing key -> 401", async () => {
    const res = await request(app).get("/").set("x-user-id", "u1").expect(401);
    expect(res.body.error.code).toBe("INTERNAL_AUTH_FAILED");
  });

  it("wrong key -> 401", async () => {
    await request(app).get("/").set("x-internal-key", "wrong").set("x-user-id", "u1").expect(401);
  });

  it("correct key but no user id -> 401", async () => {
    await request(app).get("/").set("x-internal-key", "test-key").expect(401);
  });

  it("correct key -> req.userId is set", async () => {
    const res = await request(app)
      .get("/")
      .set("x-internal-key", "test-key")
      .set("x-user-id", "u1")
      .expect(200);
    expect(res.body).toEqual({ userId: "u1" });
  });
});
