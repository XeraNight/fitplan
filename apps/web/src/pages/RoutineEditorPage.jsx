import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell.jsx";
import RoutineBuilder from "../components/routines/RoutineBuilder.jsx";
import ErrorMessage from "../components/ui/ErrorMessage.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { getRoutine } from "../api/routinesApi.js";
import { useAsync } from "../hooks/useAsync.js";
import { useRoutines } from "../hooks/useRoutines.js";
import styles from "./RoutineEditorPage.module.css";

// /routines/new and /routines/:id/edit
export default function RoutineEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { create, update } = useRoutines();
  const existing = useAsync(() => (id ? getRoutine(id) : Promise.resolve(null)), [id]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const save = async (dto) => {
    setSaving(true);
    setSaveError(null);
    try {
      if (id) await update(id, dto);
      else await create(dto);
      navigate("/routines");
    } catch (err) {
      setSaveError(err);
      setSaving(false);
    }
  };

  return (
    <AppShell title={id ? "Edit routine" : "New routine"} backTo="/routines">
      <ErrorMessage error={existing.error} onRetry={existing.reload} />
      {existing.loading ? (
        <Spinner />
      ) : (
        !existing.error && (
          <div className={styles.editor}>
            <ErrorMessage error={saveError} />
            <RoutineBuilder initial={existing.data} saving={saving} onSave={save} />
          </div>
        )
      )}
    </AppShell>
  );
}
