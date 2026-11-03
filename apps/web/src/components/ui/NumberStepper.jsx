import styles from "./NumberStepper.module.css";

// Number field with step buttons, e.g. steps={[5, 1]} -> −5 −1 [value] +1 +5. Clamped to min..max.
export default function NumberStepper({
  label,
  value,
  onChange,
  min,
  max,
  steps = [1],
  suffix,
  format = String,
}) {
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const change = (delta) => onChange(clamp(value + delta));

  const onType = (event) => {
    const digits = event.target.value.replace(/\D/g, "");
    if (digits !== "") onChange(clamp(Number(digits)));
  };

  return (
    <div className={styles.stepper} role="group" aria-label={label}>
      {steps.map((step) => (
        <button
          key={`-${step}`}
          type="button"
          className={styles.step}
          onClick={() => change(-step)}
          disabled={value <= min}
          aria-label={`${label} minus ${step}`}
        >
          −{step}
        </button>
      ))}
      <label className={styles.value}>
        <span className="visually-hidden">{label}</span>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={format(value)}
          onChange={onType}
          onFocus={(event) => event.target.select()}
          readOnly={format !== String}
          className="tabular"
        />
        {suffix && <small>{suffix}</small>}
      </label>
      {[...steps].reverse().map((step) => (
        <button
          key={`+${step}`}
          type="button"
          className={styles.step}
          onClick={() => change(step)}
          disabled={value >= max}
          aria-label={`${label} plus ${step}`}
        >
          +{step}
        </button>
      ))}
    </div>
  );
}
