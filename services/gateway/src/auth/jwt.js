import jwt from "jsonwebtoken";
import { unauthorized } from "@fitplan/shared";

// The only place that uses JWT_SECRET. Our own token, valid 7 days.
export function signToken(user, secret) {
  const { id, name, email, picture } = user;
  return jwt.sign({ name, email, picture }, secret, {
    subject: id,
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

export function verifyToken(token, secret) {
  try {
    const { sub, name, email, picture } = jwt.verify(token, secret, { algorithms: ["HS256"] });
    return { id: sub, name, email, picture };
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw unauthorized("TOKEN_EXPIRED", "Sign-in expired, please sign in again");
    }
    throw unauthorized("TOKEN_INVALID", "Invalid sign-in token");
  }
}
