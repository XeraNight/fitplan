import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { unauthorized } from "@fitplan/shared";
import { createApp } from "../src/app.js";
import { testConfig } from "./testConfig.js";

// Google itself cannot be called in tests: the verifier is replaced by a fake.
vi.mock("../src/auth/googleVerifier.js", () => ({
  verifyGoogleCredential: vi.fn(async (credential) => {
    if (credential !== "valid-google-token") throw unauthorized("GOOGLE_TOKEN_INVALID", "bad");
    return { sub: "google-123", email: "alex@example.com", name: "Alex", picture: "p.png" };
  }),
}));

const app = createApp(testConfig());

describe("Auth API", () => {
  it("valid Google credential -> our token + user", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "valid-google-token" })
      .expect(200);
    expect(res.body.user).toEqual({
      id: "google-123",
      name: "Alex",
      email: "alex@example.com",
      picture: "p.png",
    });

    const me = await request(app)
      .get("/api/auth/me")
      .set("authorization", `Bearer ${res.body.token}`)
      .expect(200);
    expect(me.body.user.id).toBe("google-123");
  });

  it("invalid Google credential -> 401", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "fake" })
      .expect(401);
    expect(res.body.error.code).toBe("GOOGLE_TOKEN_INVALID");
  });

  it("missing credential -> 400", async () => {
    await request(app).post("/api/auth/google").send({}).expect(400);
  });

  it("/me without a token -> 401 AUTH_REQUIRED", async () => {
    const res = await request(app).get("/api/auth/me").expect(401);
    expect(res.body.error.code).toBe("AUTH_REQUIRED");
  });

  it("health is public", async () => {
    expect((await request(app).get("/api/health").expect(200)).body).toEqual({ status: "ok" });
  });
});
