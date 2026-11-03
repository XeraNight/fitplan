import { timingSafeEqual } from "node:crypto";
import { unauthorized } from "./errors.js";

// Services trust only the gateway: it adds x-internal-key and the signed-in user's id (x-user-id).
export function internalAuth({ key }) {
  if (!key) throw new Error("INTERNAL_KEY is not set");
  const expected = Buffer.from(key);

  return (req, res, next) => {
    const received = Buffer.from(req.get("x-internal-key") ?? "");
    const valid = received.length === expected.length && timingSafeEqual(received, expected);
    const userId = req.get("x-user-id");
    if (!valid || !userId) {
      return next(unauthorized("INTERNAL_AUTH_FAILED", "Request did not come from the gateway"));
    }
    req.userId = userId;
    next();
  };
}
