import { loadConfig } from "../src/config.js";
import { connectDb } from "../src/db.js";
import { createApp } from "../src/app.js";

// Vercel entry (Technical Design §10.2). Vercel calls this function for every request,
// so there is no listen() here. Locally the service still starts with src/server.js.
const config = loadConfig();
const app = createApp(config);

// One database connection per running instance: the first request opens it, the next ones
// reuse it. If it fails, this request gets 503 and the next request tries again.
let connecting;

export default async function handler(req, res) {
  try {
    connecting ??= connectDb(config.mongoUri);
    await connecting;
  } catch (err) {
    connecting = undefined;
    console.error("database connection failed:", err.message);
    res.statusCode = 503;
    res.setHeader("content-type", "application/json");
    const error = { code: "SERVICE_UNAVAILABLE", message: "Database unavailable" };
    return res.end(JSON.stringify({ error }));
  }
  return app(req, res);
}
