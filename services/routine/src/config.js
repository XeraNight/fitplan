// Reads and validates environment variables once, at start-up (fail fast, not during a demo).
const required = ["MONGODB_URI", "INTERNAL_KEY"];

export function loadConfig(env = process.env) {
  const missing = required.filter((name) => !env[name]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  return Object.freeze({
    port: Number(env.PORT ?? 3001),
    mongoUri: env.MONGODB_URI,
    internalKey: env.INTERNAL_KEY,
    auditUrl: env.AUDIT_URL ?? "",
  });
}
