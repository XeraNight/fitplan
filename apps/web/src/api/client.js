import { ApiError } from "./ApiError.js";
import { getToken } from "./tokenStorage.js";

// The only place that talks to the backend.
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

let onUnauthorized = () => {};
export function setOnUnauthorized(callback) {
  onUnauthorized = callback;
}

export async function request(method, path, body) {
  const headers = { accept: "application/json" };
  const token = getToken();
  if (token) headers.authorization = `Bearer ${token}`;
  if (body !== undefined) headers["content-type"] = "application/json";

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "No connection to the server");
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data?.error ?? {};
    if (response.status === 401 && token) onUnauthorized();
    throw new ApiError(
      response.status,
      error.code ?? "UNKNOWN_ERROR",
      error.message,
      error.details,
    );
  }
  return data;
}
