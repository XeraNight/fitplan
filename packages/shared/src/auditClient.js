// Fire-and-forget audit events (Technical Design §6.4). Used from Sprint 3 (audit service).
// Without a url (tests, Sprints 1-2) send() does nothing.
export function createAuditClient({ url, key, service }) {
  return {
    send(eventType, { userId, entityType, entityId, payload = {} }) {
      if (!url) return;
      fetch(`${url}/events`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-internal-key": key, "x-user-id": userId },
        body: JSON.stringify({ eventType, userId, service, entityType, entityId, payload }),
      }).catch((err) => console.error(`audit event ${eventType} not sent:`, err.message));
    },
  };
}
