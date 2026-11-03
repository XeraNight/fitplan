import { Router } from "express";

const WAKE_UP_TIMEOUT_MS = 60_000;

export function healthRoutes(config) {
  const router = Router();

  router.get("/", (req, res) => res.json({ status: "ok" }));

  // Warm-up before a demo: calls /health of every configured service in parallel.
  router.get("/services", async (req, res) => {
    const services = Object.entries(config.services).filter(([, url]) => url);
    const results = await Promise.allSettled(
      services.map(([, url]) =>
        fetch(`${url}/health`, { signal: AbortSignal.timeout(WAKE_UP_TIMEOUT_MS) }),
      ),
    );
    const body = { gateway: "ok" };
    services.forEach(([name], i) => {
      body[name] = results[i].status === "fulfilled" && results[i].value.ok ? "ok" : "down";
    });
    res.json(body);
  });

  return router;
}
