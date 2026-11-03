// Creates the schema indexes in Atlas (and removes indexes that are no longer in the schema).
// Run: npm run db:indexes -w @fitplan/audit
import { connectDb, disconnectDb } from "../src/db.js";
import { AuditEvent } from "../src/models/AuditEvent.js";

const connection = await connectDb(process.env.MONGODB_URI);
console.log(`Connected to database "${connection.name}"`);

for (const model of [AuditEvent]) {
  await model.syncIndexes();
  const indexes = await model.listIndexes();
  console.log(`${model.collection.name}: ${indexes.map((i) => i.name).join(", ")}`);
}

await disconnectDb();
