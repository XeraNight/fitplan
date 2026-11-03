// Error code -> plain-language text. Codes are never shown to the user (UI guide rule).
const MESSAGES = {
  NETWORK_ERROR: "No connection to the server. Check your internet and try again.",
  SERVICE_UNAVAILABLE: "The server is waking up. Please try again in a minute.",
  RATE_LIMITED: "Too many requests. Please wait a moment.",
  AUTH_REQUIRED: "Please sign in again.",
  TOKEN_EXPIRED: "Your sign-in expired. Please sign in again.",
  TOKEN_INVALID: "Please sign in again.",
  GOOGLE_TOKEN_INVALID: "Google sign-in failed. Please try again.",
  ROUTINE_EXERCISE_COUNT_INVALID: "A routine needs 1–15 exercises.",
  ROUTINE_EXERCISE_UNKNOWN: "One of the exercises no longer exists. Remove it and try again.",
  ROUTINE_NOT_FOUND: "This routine does not exist (or it is not yours).",
  EXERCISE_NOT_FOUND: "This exercise does not exist.",
  VALIDATION_FAILED: "Some values are not valid. Check the routine name and the numbers.",
};

export function errorMessage(error) {
  return MESSAGES[error?.code] ?? "Something went wrong. Please try again.";
}
