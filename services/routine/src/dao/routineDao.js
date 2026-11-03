import { WorkoutRoutine } from "../models/WorkoutRoutine.js";

// Every function filters by userId: a user can never read or change someone else's routine.

export function listByUser(userId) {
  return WorkoutRoutine.find({ userId }).sort({ updatedAt: -1 }).lean();
}

export function getByIdForUser(userId, id) {
  return WorkoutRoutine.findOne({ _id: id, userId }).lean();
}

export async function create(doc) {
  return (await WorkoutRoutine.create(doc)).toObject();
}

// load + save (not updateOne) so that all schema validators run on the whole document
export async function updateForUser(userId, id, { name, exercises }) {
  const routine = await WorkoutRoutine.findOne({ _id: id, userId });
  if (!routine) return null;
  routine.set({ name, exercises });
  return (await routine.save()).toObject();
}

export async function deleteForUser(userId, id) {
  const result = await WorkoutRoutine.deleteOne({ _id: id, userId });
  return result.deletedCount > 0;
}
