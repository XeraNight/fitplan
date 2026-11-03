import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell.jsx";
import RoutineCard from "../components/routines/RoutineCard.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorMessage from "../components/ui/ErrorMessage.jsx";
import Modal from "../components/ui/Modal.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { useRoutines } from "../hooks/useRoutines.js";
import styles from "./RoutinesPage.module.css";

export default function RoutinesPage() {
  const navigate = useNavigate();
  const { routines, error, loading, reload, remove } = useRoutines();
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const create = () => navigate("/routines/new");

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await remove(toDelete._id);
      setToDelete(null);
    } catch (err) {
      setDeleteError(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell
      title="Workout Routines"
      bottomAction={
        routines.length > 0 && (
          <Button full onClick={create}>
            + Create routine
          </Button>
        )
      }
    >
      <ErrorMessage error={error} onRetry={reload} />
      {loading && routines.length === 0 && <Spinner />}
      {!loading && !error && routines.length === 0 && (
        <EmptyState
          title="No routines yet"
          text="Create your first workout template, e.g. Push Day."
          action={<Button onClick={create}>Create routine</Button>}
        />
      )}
      {routines.map((routine) => (
        <RoutineCard key={routine._id} routine={routine} onDelete={setToDelete} />
      ))}

      {toDelete && (
        <Modal
          title="Delete routine?"
          onClose={() => setToDelete(null)}
          footer={
            <>
              <Button variant="danger" full loading={deleting} onClick={confirmDelete}>
                Delete {toDelete.name}
              </Button>
              <Button variant="secondary" full onClick={() => setToDelete(null)}>
                Keep it
              </Button>
            </>
          }
        >
          <p className={styles.confirm}>
            <b>{toDelete.name}</b> will be deleted. This cannot be undone.
          </p>
          <ErrorMessage error={deleteError} />
        </Modal>
      )}
    </AppShell>
  );
}
