import { useEffect, useState } from "react";
import styles from "./Spinner.module.css";

// Appears only after `delay` ms, so fast answers never flicker (UI guide rule).
export default function Spinner({
  delay = 300,
  inline = false,
  fullPage = false,
  label = "Loading",
}) {
  const [visible, setVisible] = useState(delay === 0);
  useEffect(() => {
    if (delay === 0) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;
  const spinner = <span className={styles.spinner} role="status" aria-label={label} />;
  if (inline) return spinner;
  return <div className={fullPage ? styles.page : styles.block}>{spinner}</div>;
}
