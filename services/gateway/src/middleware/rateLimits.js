import { rateLimit } from "express-rate-limit";

const tooMany = (req, res) =>
  res
    .status(429)
    .json({ error: { code: "RATE_LIMITED", message: "Too many requests, try later" } });

const WINDOW = 15 * 60 * 1000;

export const generalLimiter = rateLimit({
  windowMs: WINDOW,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: tooMany,
});

// login flooding / brute force
export const authLimiter = rateLimit({
  windowMs: WINDOW,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: tooMany,
});
