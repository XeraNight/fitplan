// Fills the read-only exercise catalog. Safe to run repeatedly (upsert by name).
// Run: npm run seed -w @fitplan/routine
import { readFile } from "node:fs/promises";
import { connectDb, disconnectDb } from "../src/db.js";
import { Exercise } from "../src/models/Exercise.js";
import { upsertByName } from "../src/dao/exerciseDao.js";

const exercises = JSON.parse(await readFile(new URL("./exercises.json", import.meta.url), "utf8"));

const connection = await connectDb(process.env.MONGODB_URI);
console.log(`Connected to database "${connection.name}"`);
await Exercise.init(); // unique index on name must exist before upserting

const counts = { inserted: 0, updated: 0 };
for (const exercise of exercises) {
  counts[await upsertByName(exercise)] += 1;
}

console.log(`inserted ${counts.inserted} / updated ${counts.updated}`);
console.log(`catalog now has ${await Exercise.countDocuments()} exercises`);
await disconnectDb();
