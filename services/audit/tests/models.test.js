import "./setup.js";
import { describe, expect, it } from "vitest";
import { AuditEvent } from "../src/models/AuditEvent.js";

const event = (extra = {}) => ({
  eventType: "ROUTINE_CREATED",
  userId: "google-user-1",
  service: "routine",
  entityType: "WorkoutRoutine",
  entityId: "665f1c2e9b1e8a0012345678",
  payload: { name: "Push Day" },
  ...extra,
});

describe("AuditEvent", () => {
  it("stores a valid event with occurredAt", async () => {
    const saved = await AuditEvent.create(event());
    expect(saved.occurredAt).toBeInstanceOf(Date);
  });

  it("rejects an unknown event type", async () => {
    await expect(AuditEvent.create(event({ eventType: "SOMETHING_ELSE" }))).rejects.toThrow();
  });

  it("fields cannot be changed after saving (document.save)", async () => {
    const saved = await AuditEvent.create(event());
    saved.eventType = "ROUTINE_DELETED";
    saved.userId = "someone-else";
    await saved.save();
    const reloaded = await AuditEvent.findById(saved._id).lean();
    expect(reloaded.eventType).toBe("ROUTINE_CREATED");
    expect(reloaded.userId).toBe("google-user-1");
  });

  it("fields cannot be changed after saving (updateOne)", async () => {
    const saved = await AuditEvent.create(event());
    await AuditEvent.updateOne({ _id: saved._id }, { $set: { eventType: "ROUTINE_DELETED" } });
    const reloaded = await AuditEvent.findById(saved._id).lean();
    expect(reloaded.eventType).toBe("ROUTINE_CREATED");
  });
});
