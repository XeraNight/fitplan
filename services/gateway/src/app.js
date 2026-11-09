import express from "express";
import helmet from "helmet";
import cors from "cors";
import { createAuditClient, errorHandler, notFound } from "@fitplan/shared";
import { generalLimiter } from "./middleware/rateLimits.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { healthRoutes } from "./health/healthRoutes.js";
import { authRoutes } from "./auth/authRoutes.js";
import { buildProxies } from "./proxy/serviceProxy.js";

// Middleware order of Technical Design §5.4. express.json() is NOT used before the proxy:
// the proxy streams the original request body to the service.
export function createApp(config) {
  const audit = createAuditClient({
    url: config.services.audit,
    key: config.internalKey,
    service: "gateway",
  });

  const app = express();
  app.set("trust proxy", 1); // Vercel's proxy in front: see the real client IP for rate limits
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(generalLimiter);
  app.use("/api/health", healthRoutes(config));
  app.use("/api/auth", authRoutes(config, audit));
  app.use("/api", requireAuth(config));
  for (const [prefix, proxy] of buildProxies(config)) app.use(prefix, proxy);
  app.use((req, res, next) => next(notFound("ROUTE_NOT_FOUND", `${req.method} ${req.path}`)));
  app.use(errorHandler);
  return app;
}
