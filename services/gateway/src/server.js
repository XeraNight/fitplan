// Local start (npm run dev). On Vercel, api/index.js is used instead.
import { loadConfig } from "./config.js";
import { createApp } from "./app.js";

const config = loadConfig();
createApp(config).listen(config.port, () => console.log(`gateway on :${config.port}`));
