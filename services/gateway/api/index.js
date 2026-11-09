import { loadConfig } from "../src/config.js";
import { createApp } from "../src/app.js";

// Vercel entry (Technical Design §10.2). Vercel calls the exported Express app for every request,
// so there is no listen() here. Locally the gateway still starts with src/server.js.
export default createApp(loadConfig());
