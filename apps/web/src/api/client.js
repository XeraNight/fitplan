import { ApiError } from "./ApiError.js";
import { getToken } from "./tokenStorage.js";

// The only place that talks to the backend.
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Free Render services sleep after 15 min; while one wakes up (about a minute) Render answers
// 502/503/504 without our JSON. Reads are retried quietly instead of showing an error.
const WAKING_STATUSES = new Set([502, 503, 504]);
export const RETRY_DELAY_MS = 5_000;
export const MAX_WAKE_UP_MS = 75_000;

let onUnauthorized = () => {};
export function setOnUnauthorized(callback) {
  onUnauthorized = callback;
}

export async function request(method, path, body) {
  const started = Date.now();
  for (;;) {
    try {
      return await send(method, path, body);
    } catch (err) {
      // only GET is repeated: repeating a POST could create the same routine twice
      const retry =
        method === "GET" &&
        err.code === "SERVICE_UNAVAILABLE" &&
        Date.now() - started < MAX_WAKE_UP_MS;
      if (!retry) throw err;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

async function send(method, path, body) {
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
    const fallback = WAKING_STATUSES.has(response.status) ? "SERVICE_UNAVAILABLE" : "UNKNOWN_ERROR";
    throw new ApiError(response.status, error.code ?? fallback, error.message, error.details);
  }
  return data;
}
