import { Router } from "express";

// GET /health for the warm-up call and for checking a deployment. No authentication.
export function healthRoute(mongoose) {
  const router = Router();
  router.get("/health", (req, res) => {
    const body = { status: "ok" };
    if (mongoose) body.db = mongoose.connection.readyState === 1 ? "up" : "down";
    res.json(body);
  });
  return router;
}
