import mongoose from "mongoose";

// The only place that opens the database connection.
// autoIndex: true -> Mongoose creates the schema indexes on start.
export async function connectDb(uri) {
  if (!uri) throw new Error("MONGODB_URI is not set (see .env.example)");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { autoIndex: true, serverSelectionTimeoutMS: 10000 });
  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
