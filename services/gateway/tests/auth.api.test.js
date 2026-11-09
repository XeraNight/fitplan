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

// Technical Design §5.4 and §5.5: CORS lets only our frontend call the API, rate limits stop flooding.
describe("Edge security: CORS and rate limits", () => {
  const ourFrontend = "http://localhost:5173"; // = corsOrigin in testConfig

  it("CORS: our frontend is allowed to read the answer", async () => {
    const res = await request(app).get("/api/health").set("origin", ourFrontend).expect(200);
    expect(res.headers["access-control-allow-origin"]).toBe(ourFrontend);
  });

  it("CORS: another website gets no permission, so the browser blocks it", async () => {
    const res = await request(app).get("/api/health").set("origin", "https://evil.example");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("CORS: the browser's pre-check before saving a routine is answered without a token", async () => {
    const res = await request(app)
      .options("/api/routines")
      .set("origin", ourFrontend)
      .set("access-control-request-method", "POST")
      .set("access-control-request-headers", "authorization,content-type")
      .expect(204);
    expect(res.headers["access-control-allow-origin"]).toBe(ourFrontend);
    expect(res.headers["access-control-allow-headers"]).toContain("authorization");
  });

  it("general rate limit: 300 requests per 15 min per IP", async () => {
    const res = await request(app).get("/api/health").expect(200);
    expect(res.headers["ratelimit-policy"]).toContain('"300-in-15min"');
  });

  it("21st sign-in from one IP within 15 min -> 429 RATE_LIMITED, other IPs still pass", async () => {
    // trust proxy: the client IP comes from X-Forwarded-For, as on Vercel
    const login = (ip) => request(app).post("/api/auth/google").set("x-forwarded-for", ip).send({});
    for (let i = 0; i < 20; i++) expect((await login("203.0.113.1")).status).toBe(400);

    const blocked = await login("203.0.113.1");
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe("RATE_LIMITED");
    expect((await login("203.0.113.2")).status).toBe(400);
  });
});
