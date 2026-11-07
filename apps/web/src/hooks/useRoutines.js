import { useCallback, useState } from "react";
import * as routinesApi from "../api/routinesApi.js";
import { useAsync } from "./useAsync.js";

// The user's routines; the list is reloaded after every change.
export function useRoutines() {
  const { data, error, loading, reload } = useAsync(routinesApi.listRoutines, []);
  const [removedIds, setRemovedIds] = useState([]);

  const remove = useCallback(
    async (id) => {
      await routinesApi.deleteRoutine(id);
      setRemovedIds((ids) => [...ids, id]); // gone at once, even if the reload is slow
      reload();
    },
    [reload],
  );

  return {
    routines: (data ?? []).filter((routine) => !removedIds.includes(routine._id)),
    error,
    loading,
    reload,
    create: routinesApi.createRoutine,
    update: routinesApi.updateRoutine,
    remove,
  };
}
