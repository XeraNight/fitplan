import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <main className={styles.page}>
      <h1>Page not found</h1>
      <p>This page does not exist.</p>
      <Link to="/routines">Back to my routines</Link>
    </main>
  );
}
