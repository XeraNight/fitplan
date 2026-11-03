import { useEffect, useState } from "react";
import { listExercises } from "../api/exercisesApi.js";
import { useAsync } from "./useAsync.js";

// Exercise catalog with a category filter and a search that waits 300 ms after typing.
export function useExercises({ category, q }) {
  const [query, setQuery] = useState(q);
  useEffect(() => {
    const timer = setTimeout(() => setQuery(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);

  return useAsync(() => listExercises({ category, q: query }), [category, query]);
}
