// Creates the schema indexes in Atlas (and removes indexes that are no longer in the schema).
// Run: npm run db:indexes -w @fitplan/session
import { connectDb, disconnectDb } from "../src/db.js";
import { WorkoutSession } from "../src/models/WorkoutSession.js";
import { ProgressLog } from "../src/models/ProgressLog.js";

const connection = await connectDb(process.env.MONGODB_URI);
console.log(`Connected to database "${connection.name}"`);

for (const model of [WorkoutSession, ProgressLog]) {
  await model.syncIndexes();
  const indexes = await model.listIndexes();
  console.log(`${model.collection.name}: ${indexes.map((i) => i.name).join(", ")}`);
}

await disconnectDb();
