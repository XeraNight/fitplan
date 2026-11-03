import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { signToken, verifyToken } from "../src/auth/jwt.js";

const SECRET = "test-secret-test-secret-test-secret-123";
const user = { id: "google-123", name: "Alex", email: "alex@example.com", picture: "p.png" };

describe("jwt", () => {
  it("sign -> verify returns the same user", () => {
    expect(verifyToken(signToken(user, SECRET), SECRET)).toEqual(user);
  });

  it("expired token -> TOKEN_EXPIRED", () => {
    const old = jwt.sign({ name: "Alex" }, SECRET, { subject: "google-123", expiresIn: -10 });
    expect(() => verifyToken(old, SECRET)).toThrow(
      expect.objectContaining({ code: "TOKEN_EXPIRED" }),
    );
  });

  it("token signed with another secret -> TOKEN_INVALID", () => {
    const forged = signToken(user, "another-secret-another-secret-12345");
    expect(() => verifyToken(forged, SECRET)).toThrow(
      expect.objectContaining({ status: 401, code: "TOKEN_INVALID" }),
    );
  });

  it("unsigned token (alg none) is rejected", () => {
    const none = jwt.sign({ name: "Alex" }, null, { subject: "x", algorithm: "none" });
    expect(() => verifyToken(none, SECRET)).toThrow(
      expect.objectContaining({ code: "TOKEN_INVALID" }),
    );
  });
});
