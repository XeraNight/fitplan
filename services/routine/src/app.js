import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { errorHandler, healthRoute, internalAuth, notFound } from "@fitplan/shared";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";

// The whole request pipeline in one place. Exported without listen() so tests can use it.
export function createApp({ internalKey }) {
  const app = express();
  app.use(helmet());
  app.use(healthRoute(mongoose));
  app.use(internalAuth({ key: internalKey }));
  app.use(express.json({ limit: "100kb" }));
  app.use(exerciseRoutes);
  app.use(routineRoutes);
  app.use((req, res, next) => next(notFound("ROUTE_NOT_FOUND", `${req.method} ${req.path}`)));
  app.use(errorHandler);
  return app;
}
