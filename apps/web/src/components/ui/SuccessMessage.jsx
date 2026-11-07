import { useEffect } from "react";
import styles from "./SuccessMessage.module.css";

const VISIBLE_MS = 4000;

// Confirmation after a finished action (US1). It floats over the page, so it is seen
// even when the list is scrolled, and closes itself.
export default function SuccessMessage({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className={styles.success} role="status">
      <span className={styles.check} aria-hidden="true">
        ✓
      </span>
      <p>{message}</p>
    </div>
  );
}
