import NumberStepper from "../ui/NumberStepper.jsx";
import { formatRest } from "../../utils/format.js";
import styles from "./RoutineItemEditor.module.css";

// One exercise of the routine: target sets, rep range, rest, move up / down, remove.
export default function RoutineItemEditor({ item, index, count, onChange, onMove, onRemove }) {
  const set = (field) => (value) => {
    const next = { ...item, [field]: value };
    // keep the rep range valid: repMin <= repMax
    if (field === "repMin" && value > next.repMax) next.repMax = value;
    if (field === "repMax" && value < next.repMin) next.repMin = value;
    onChange(next);
  };

  return (
    <li className={styles.item}>
      <div className={styles.head}>
        <span className={styles.num}>{index + 1}</span>
        <b>{item.exerciseName}</b>
        <button
          type="button"
          className={styles.icon}
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label={`Move ${item.exerciseName} up`}
        >
          ↑
        </button>
        <button
          type="button"
          className={styles.icon}
          onClick={() => onMove(1)}
          disabled={index === count - 1}
          aria-label={`Move ${item.exerciseName} down`}
        >
          ↓
        </button>
        <button
          type="button"
          className={`${styles.icon} ${styles.remove}`}
          onClick={onRemove}
          aria-label={`Remove ${item.exerciseName}`}
        >
          ✕
        </button>
      </div>
      <div className={styles.grid}>
        <span className={styles.label}>Sets</span>
        <NumberStepper
          label="Sets"
          value={item.targetSets}
          onChange={set("targetSets")}
          min={1}
          max={10}
        />
        <span className={styles.label}>Min reps</span>
        <NumberStepper
          label="Minimum reps"
          value={item.repMin}
          onChange={set("repMin")}
          min={1}
          max={50}
        />
        <span className={styles.label}>Max reps</span>
        <NumberStepper
          label="Maximum reps"
          value={item.repMax}
          onChange={set("repMax")}
          min={1}
          max={50}
        />
        <span className={styles.label}>Rest</span>
        <NumberStepper
          label="Rest"
          value={item.restSeconds}
          onChange={set("restSeconds")}
          min={0}
          max={600}
          steps={[15]}
          format={formatRest}
        />
      </div>
    </li>
  );
}
