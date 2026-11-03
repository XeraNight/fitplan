import styles from "./Badge.module.css";

// tone: neutral | blue | gold (gold is only for personal records)
export default function Badge({ tone = "neutral", children }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
