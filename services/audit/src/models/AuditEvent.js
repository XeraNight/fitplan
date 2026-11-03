import mongoose from "mongoose";

export const EVENT_TYPES = [
  "USER_LOGGED_IN",
  "ROUTINE_CREATED",
  "ROUTINE_UPDATED",
  "ROUTINE_DELETED",
  "SESSION_STARTED",
  "SESSION_FINISHED",
  "SESSION_DISCARDED",
  "SET_LOGGED",
  "PR_ACHIEVED",
];
export const SERVICES = ["gateway", "routine", "session"];
export const ENTITY_TYPES = ["WorkoutRoutine", "WorkoutSession", "ProgressLog", "User"];

// Every field is immutable: once saved, an event can never be changed.
const AuditEventSchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true, enum: EVENT_TYPES, immutable: true },
    userId: { type: String, required: true, immutable: true },
    service: { type: String, required: true, enum: SERVICES, immutable: true },
    entityType: { type: String, required: true, enum: ENTITY_TYPES, immutable: true },
    entityId: { type: String, required: true, immutable: true },
    payload: { type: Object, default: {}, immutable: true },
    occurredAt: { type: Date, default: Date.now, immutable: true },
  },
  // occurredAt is the event time; an immutable event has no updatedAt.
  { timestamps: { createdAt: true, updatedAt: false }, collection: "events" },
);

AuditEventSchema.index({ userId: 1, occurredAt: -1 });

export const AuditEvent = mongoose.model("AuditEvent", AuditEventSchema);
