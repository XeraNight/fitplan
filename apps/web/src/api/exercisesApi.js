import { request } from "./client.js";

export function listExercises({ category, q } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const query = params.toString();
  return request("GET", `/exercises${query ? `?${query}` : ""}`);
}
