import styles from "./EmptyState.module.css";

export default function EmptyState({ title, text, action }) {
  return (
    <div className={styles.empty}>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
