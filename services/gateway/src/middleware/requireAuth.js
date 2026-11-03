import { unauthorized } from "@fitplan/shared";
import { verifyToken } from "../auth/jwt.js";

// Everything after this middleware needs a valid JWT: sets req.user = { id, name, email, picture }.
export function requireAuth(config) {
  return (req, res, next) => {
    const [scheme, token] = (req.get("authorization") ?? "").split(" ");
    if (scheme !== "Bearer" || !token) {
      return next(unauthorized("AUTH_REQUIRED", "Please sign in"));
    }
    req.user = verifyToken(token, config.jwtSecret);
    next();
  };
}
