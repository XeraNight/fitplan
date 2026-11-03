// Reads and validates environment variables once, at start-up (fail fast, not during a demo).
const required = ["JWT_SECRET", "GOOGLE_CLIENT_ID", "CORS_ORIGIN", "INTERNAL_KEY", "ROUTINE_URL"];

export function loadConfig(env = process.env) {
  const missing = required.filter((name) => !env[name]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  if (env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must have at least 32 characters");
  return Object.freeze({
    port: Number(env.PORT ?? 3000),
    jwtSecret: env.JWT_SECRET,
    googleClientId: env.GOOGLE_CLIENT_ID,
    corsOrigin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    internalKey: env.INTERNAL_KEY,
    services: Object.freeze({
      routine: env.ROUTINE_URL,
      session: env.SESSION_URL ?? "",
      audit: env.AUDIT_URL ?? "",
    }),
  });
}
