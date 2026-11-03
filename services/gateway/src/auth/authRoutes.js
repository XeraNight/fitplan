import express, { Router } from "express";
import { authLimiter } from "../middleware/rateLimits.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { createAuthController } from "./authController.js";

export function authRoutes(config, audit) {
  const controller = createAuthController(config, audit);
  const router = Router();
  router.post("/google", authLimiter, express.json({ limit: "10kb" }), controller.loginWithGoogle);
  router.get("/me", requireAuth(config), controller.me);
  return router;
}
