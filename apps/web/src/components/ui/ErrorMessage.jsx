import { errorMessage } from "../../utils/errorMessages.js";
import Button from "./Button.jsx";
import styles from "./ErrorMessage.module.css";

export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className={styles.error} role="alert">
      <p>{errorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" small onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
