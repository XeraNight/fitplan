import { useState } from "react";
import Button from "../ui/Button.jsx";
import ExercisePicker from "./ExercisePicker.jsx";
import RoutineItemEditor from "./RoutineItemEditor.jsx";
import styles from "./RoutineBuilder.module.css";

export const MAX_EXERCISES = 15; // R-1, the server checks it again

const newItem = (exercise) => ({
  exerciseId: exercise._id,
  exerciseName: exercise.name,
  targetSets: 3,
  repMin: 8,
  repMax: 12,
  restSeconds: 90,
});

// Name + ordered list of exercises. Save is disabled with no exercises or no name.
export default function RoutineBuilder({ initial, saving, onSave }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [items, setItems] = useState(initial?.exercises ?? []);
  const [picking, setPicking] = useState(false);

  const full = items.length >= MAX_EXERCISES;
  const canSave = name.trim().length > 0 && items.length > 0 && !saving;

  const update = (index, next) => setItems(items.map((item, i) => (i === index ? next : item)));
  const remove = (index) => setItems(items.filter((_, i) => i !== index));
  const move = (index, delta) => {
    const next = [...items];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setItems(next);
  };
  const add = (exercise) => {
    setItems([...items, newItem(exercise)]);
    setPicking(false);
  };

  const submit = (event) => {
    event.preventDefault();
    if (!canSave) return;
    onSave({
      name: name.trim(),
      exercises: items.map(({ exerciseId, targetSets, repMin, repMax, restSeconds }) => ({
        exerciseId,
        targetSets,
        repMin,
        repMax,
        restSeconds,
      })),
    });
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.label} htmlFor="routine-name">
        Routine name
      </label>
      <input
        id="routine-name"
        className={styles.input}
        value={name}
        maxLength={60}
        placeholder="e.g. Push Day"
        onChange={(event) => setName(event.target.value)}
      />

      <div className={styles.row}>
        <span className={styles.label}>Exercises</span>
        <span className={`${styles.count} tabular`} aria-live="polite">
          {items.length} / {MAX_EXERCISES}
        </span>
      </div>

      <ol className={styles.items}>
        {items.map((item, index) => (
          <RoutineItemEditor
            key={`${item.exerciseId}-${index}`}
            item={item}
            index={index}
            count={items.length}
            onChange={(next) => update(index, next)}
            onMove={(delta) => move(index, delta)}
            onRemove={() => remove(index)}
          />
        ))}
      </ol>
      {items.length === 0 && <p className={styles.hint}>Add at least one exercise.</p>}

      <Button variant="secondary" full onClick={() => setPicking(true)} disabled={full}>
        {full ? `Maximum ${MAX_EXERCISES} exercises` : "+ Add exercise"}
      </Button>

      <div className={styles.bottom}>
        <Button type="submit" full disabled={!canSave} loading={saving}>
          Save routine
        </Button>
      </div>

      {picking && <ExercisePicker onPick={add} onClose={() => setPicking(false)} />}
    </form>
  );
}
