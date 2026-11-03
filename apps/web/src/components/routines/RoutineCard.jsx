import { Link } from "react-router-dom";
import Button from "../ui/Button.jsx";
import styles from "./RoutineCard.module.css";

// The "Start workout" button arrives in Sprint 2, together with the workout screen.
export default function RoutineCard({ routine, onDelete }) {
  const names = routine.exercises.map((e) => e.exerciseName);
  const preview = names.slice(0, 3).join(", ") + (names.length > 3 ? ", …" : "");
  const count = routine.exercises.length;

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <h3>{routine.name}</h3>
        <span className={styles.meta}>
          {count} {count === 1 ? "exercise" : "exercises"}
        </span>
      </div>
      <p className={styles.meta}>{preview}</p>
      <div className={styles.actions}>
        <Link to={`/routines/${routine._id}/edit`} className={styles.edit}>
          Edit
        </Link>
        <Button variant="danger-text" small onClick={() => onDelete(routine)}>
          Delete
        </Button>
      </div>
    </article>
  );
}
