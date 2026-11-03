export const testConfig = (services = {}) =>
  Object.freeze({
    port: 0,
    jwtSecret: "test-secret-test-secret-test-secret-123",
    googleClientId: "test-client.apps.googleusercontent.com",
    corsOrigin: ["http://localhost:5173"],
    internalKey: "test-internal-key",
    services: { routine: "http://127.0.0.1:9", session: "", audit: "", ...services },
  });
