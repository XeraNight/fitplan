import { useCallback } from "react";
import * as routinesApi from "../api/routinesApi.js";
import { useAsync } from "./useAsync.js";

// The user's routines; the list is reloaded after every change.
export function useRoutines() {
  const { data, error, loading, reload } = useAsync(routinesApi.listRoutines, []);

  const remove = useCallback(
    async (id) => {
      await routinesApi.deleteRoutine(id);
      reload();
    },
    [reload],
  );

  return {
    routines: data ?? [],
    error,
    loading,
    reload,
    create: routinesApi.createRoutine,
    update: routinesApi.updateRoutine,
    remove,
  };
}
