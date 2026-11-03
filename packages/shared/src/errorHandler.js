import { AppError } from "./errors.js";

// Uniform error JSON: { error: { code, message, details? } } (Technical Design §9.1).
// eslint-disable-next-line no-unused-vars -- Express recognises error middleware by its 4 parameters
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json(body(err.code, err.message, err.details));
  }
  if (err.name === "ValidationError") {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([path, e]) => [path, e.message]),
    );
    return res.status(400).json(body("VALIDATION_FAILED", "Invalid data", details));
  }
  if (err.name === "CastError") {
    return res.status(404).json(body("NOT_FOUND", "Not found"));
  }
  if (err.code === 11000) {
    return res.status(409).json(body("DUPLICATE", "Already exists"));
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json(body("INVALID_JSON", "Request body is not valid JSON"));
  }
  console.error(err);
  return res.status(500).json(body("INTERNAL_ERROR", "Something went wrong"));
}

const body = (code, message, details) => ({
  error: details ? { code, message, details } : { code, message },
});
