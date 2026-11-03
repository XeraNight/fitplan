import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

// Accessible dialog: a bottom sheet on phones, centred on large screens. Esc or the backdrop closes it.
export default function Modal({ title, onClose, children, footer }) {
  const panel = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    // focus a text field if there is one, never a destructive button (Enter must not delete)
    (panel.current?.querySelector("input") ?? panel.current)?.focus();
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panel}
      >
        <div className={styles.grab} aria-hidden="true" />
        <div className={styles.head}>
          <h2>{title}</h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
            data-close
          >
            ✕
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
