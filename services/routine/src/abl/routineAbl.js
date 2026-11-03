import mongoose from "mongoose";
import { badRequest, createAuditClient, notFound } from "@fitplan/shared";
import * as exerciseDao from "../dao/exerciseDao.js";
import * as routineDao from "../dao/routineDao.js";
import { MAX_EXERCISES, MIN_EXERCISES } from "../models/WorkoutRoutine.js";

// All business rules of workout routines live in this file.

const audit = createAuditClient({
  url: process.env.AUDIT_URL,
  key: process.env.INTERNAL_KEY,
  service: "routine",
});

export function list(userId) {
  return routineDao.listByUser(userId);
}

export async function get(userId, id) {
  const routine = mongoose.isValidObjectId(id) ? await routineDao.getByIdForUser(userId, id) : null;
  if (!routine) throw notFound("ROUTINE_NOT_FOUND", "Routine not found");
  return routine;
}

export async function create(userId, dto) {
  const routine = await routineDao.create({ userId, ...(await buildRoutine(dto)) });
  sendAudit("ROUTINE_CREATED", userId, routine);
  return routine;
}

export async function update(userId, id, dto) {
  const doc = await buildRoutine(dto);
  const routine = mongoose.isValidObjectId(id)
    ? await routineDao.updateForUser(userId, id, doc)
    : null;
  if (!routine) throw notFound("ROUTINE_NOT_FOUND", "Routine not found");
  sendAudit("ROUTINE_UPDATED", userId, routine);
  return routine;
}

export async function remove(userId, id) {
  const deleted = mongoose.isValidObjectId(id) && (await routineDao.deleteForUser(userId, id));
  if (!deleted) throw notFound("ROUTINE_NOT_FOUND", "Routine not found");
  sendAudit("ROUTINE_DELETED", userId, { _id: id });
}

// Checks R-1 and the catalog, then builds the document: order + exercise name snapshot.
async function buildRoutine(dto = {}) {
  const items = dto.exercises;
  // R-1: a routine has 1-15 exercises
  if (!Array.isArray(items) || items.length < MIN_EXERCISES || items.length > MAX_EXERCISES) {
    throw badRequest(
      "ROUTINE_EXERCISE_COUNT_INVALID",
      `A routine needs ${MIN_EXERCISES}-${MAX_EXERCISES} exercises.`,
      { count: Array.isArray(items) ? items.length : 0 },
    );
  }

  const ids = items.map((item) => String(item?.exerciseId ?? ""));
  const validIds = [...new Set(ids.filter((id) => mongoose.isValidObjectId(id)))];
  const exercises = await exerciseDao.getManyByIds(validIds);
  const byId = new Map(exercises.map((e) => [String(e._id), e]));
  const unknownIds = ids.filter((id) => !byId.has(id));
  if (unknownIds.length) {
    throw badRequest("ROUTINE_EXERCISE_UNKNOWN", "Unknown exercise in the routine.", {
      unknownIds,
    });
  }

  return {
    name: dto.name,
    exercises: items.map((item, index) => ({
      exerciseId: item.exerciseId,
      exerciseName: byId.get(String(item.exerciseId)).name,
      order: index + 1,
      targetSets: item.targetSets,
      repMin: item.repMin,
      repMax: item.repMax,
      restSeconds: item.restSeconds,
    })),
  };
}

function sendAudit(eventType, userId, routine) {
  audit.send(eventType, {
    userId,
    entityType: "WorkoutRoutine",
    entityId: String(routine._id),
    payload: routine.name ? { name: routine.name } : {},
  });
}
