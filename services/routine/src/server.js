import { loadConfig } from "./config.js";
import { connectDb, disconnectDb } from "./db.js";
import { createApp } from "./app.js";

const config = loadConfig();
await connectDb(config.mongoUri);
const server = createApp(config).listen(config.port, () =>
  console.log(`routine service on :${config.port}`),
);

// Render sends SIGTERM on every redeploy: finish open requests, then close the DB connection.
process.on("SIGTERM", () => {
  server.close(async () => {
    await disconnectDb();
    process.exit(0);
  });
});
