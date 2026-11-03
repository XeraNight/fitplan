import { useState } from "react";
import { useExercises } from "../../hooks/useExercises.js";
import Modal from "../ui/Modal.jsx";
import Spinner from "../ui/Spinner.jsx";
import ErrorMessage from "../ui/ErrorMessage.jsx";
import styles from "./ExercisePicker.module.css";

const CATEGORIES = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

// Bottom sheet: search the catalog or filter by muscle group, add an exercise with one tap.
export default function ExercisePicker({ onPick, onClose }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const { data, error, loading, reload } = useExercises({ category, q });

  return (
    <Modal title="Add exercise" onClose={onClose}>
      <input
        className={styles.search}
        type="search"
        placeholder="Search exercises"
        value={q}
        onChange={(event) => setQ(event.target.value)}
        aria-label="Search exercises"
      />
      <div className={styles.chips} role="group" aria-label="Muscle group">
        {["", ...CATEGORIES].map((c) => (
          <button
            key={c || "all"}
            type="button"
            className={`${styles.chip} ${category === c ? styles.on : ""}`}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c || "All"}
          </button>
        ))}
      </div>
      <ErrorMessage error={error} onRetry={reload} />
      {loading && !data ? (
        <Spinner />
      ) : (
        <ul className={styles.list}>
          {data?.map((exercise) => (
            <li key={exercise._id}>
              <button type="button" className={styles.row} onClick={() => onPick(exercise)}>
                <span className={styles.text}>
                  <b>{exercise.name}</b>
                  <small>
                    {exercise.primaryMuscle} · {exercise.equipment}
                  </small>
                </span>
                <span className={styles.plus} aria-hidden="true">
                  +
                </span>
              </button>
            </li>
          ))}
          {data?.length === 0 && <li className={styles.none}>No exercise found.</li>}
        </ul>
      )}
    </Modal>
  );
}
