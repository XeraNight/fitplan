import { Exercise } from "../models/Exercise.js";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function list({ category, q } = {}) {
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };
  return Exercise.find(filter).sort({ category: 1, name: 1 }).lean();
}

export function getById(id) {
  return Exercise.findById(id).lean();
}

export function getManyByIds(ids) {
  return Exercise.find({ _id: { $in: ids } }).lean();
}

// Used by the seed script: insert a new exercise or update the existing one with the same name.
export async function upsertByName({ name, ...fields }) {
  const result = await Exercise.updateOne(
    { name },
    { $set: fields },
    { upsert: true, runValidators: true },
  );
  return result.upsertedCount > 0 ? "inserted" : "updated";
}
