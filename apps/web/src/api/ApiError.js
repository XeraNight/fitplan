export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message ?? code);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
