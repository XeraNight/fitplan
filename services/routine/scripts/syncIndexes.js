// Creates the schema indexes in Atlas (and removes indexes that are no longer in the schema).
// Run: npm run db:indexes -w @fitplan/routine
import { connectDb, disconnectDb } from "../src/db.js";
import { Exercise } from "../src/models/Exercise.js";
import { WorkoutRoutine } from "../src/models/WorkoutRoutine.js";

const connection = await connectDb(process.env.MONGODB_URI);
console.log(`Connected to database "${connection.name}"`);

for (const model of [Exercise, WorkoutRoutine]) {
  await model.syncIndexes();
  const indexes = await model.listIndexes();
  console.log(`${model.collection.name}: ${indexes.map((i) => i.name).join(", ")}`);
}

await disconnectDb();
