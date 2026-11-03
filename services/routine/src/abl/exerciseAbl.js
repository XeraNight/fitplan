import mongoose from "mongoose";
import { notFound } from "@fitplan/shared";
import * as exerciseDao from "../dao/exerciseDao.js";

export function list({ category, q } = {}) {
  return exerciseDao.list({ category, q: q?.trim() });
}

export async function get(id) {
  const exercise = mongoose.isValidObjectId(id) ? await exerciseDao.getById(id) : null;
  if (!exercise) throw notFound("EXERCISE_NOT_FOUND", "Exercise not found");
  return exercise;
}
