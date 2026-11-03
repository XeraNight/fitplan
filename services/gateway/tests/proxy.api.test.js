import { afterAll, beforeAll, describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import { createApp } from "../src/app.js";
import { signToken } from "../src/auth/jwt.js";
import { testConfig } from "./testConfig.js";

// A tiny fake routine service that records what it received.
let received;
let fakeService;
let app;
let token;

beforeAll(async () => {
  const fake = express();
  fake.use(express.json());
  fake.all("/{*path}", (req, res) => {
    received = { path: req.path, headers: req.headers, body: req.body };
    res.status(201).json({ ok: true });
  });
  fake.get("/health", (req, res) => res.json({ status: "ok" }));
  await new Promise((resolve) => (fakeService = fake.listen(0, resolve)));
  const config = testConfig({ routine: `http://127.0.0.1:${fakeService.address().port}` });
  app = createApp(config);
  token = signToken({ id: "google-123", name: "Alex" }, config.jwtSecret);
});

afterAll(() => fakeService.close());

describe("Proxy to the routine service", () => {
  it("strips /api, forwards body, adds identity headers, removes Authorization", async () => {
    await request(app)
      .post("/api/routines")
      .set("authorization", `Bearer ${token}`)
      .set("x-user-id", "attacker") // a client cannot pretend to be someone else
      .send({ name: "Push Day" })
      .expect(201);

    expect(received.path).toBe("/routines");
    expect(received.body).toEqual({ name: "Push Day" });
    expect(received.headers["x-user-id"]).toBe("google-123");
    expect(received.headers["x-internal-key"]).toBe("test-internal-key");
    expect(received.headers.authorization).toBeUndefined();
  });

  it("no token -> 401, nothing reaches the service", async () => {
    received = undefined;
    await request(app).get("/api/routines").expect(401);
    expect(received).toBeUndefined();
  });

  it("paths that are not in the routing table -> 404", async () => {
    await request(app).get("/api/sessions").set("authorization", `Bearer ${token}`).expect(404);
    await request(app).get("/api/routinesX").set("authorization", `Bearer ${token}`).expect(404);
  });

  it("service down -> 503 SERVICE_UNAVAILABLE", async () => {
    const original = console.error;
    console.error = () => {};
    const down = createApp(testConfig({ routine: "http://127.0.0.1:9" }));
    const res = await request(down).get("/api/routines").set("authorization", `Bearer ${token}`);
    console.error = original;
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("/api/health/services reports each service", async () => {
    const res = await request(app).get("/api/health/services").expect(200);
    expect(res.body).toEqual({ gateway: "ok", routine: "ok" });
  });
});
