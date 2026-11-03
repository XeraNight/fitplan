import styles from "./Button.module.css";
import Spinner from "./Spinner.jsx";

// variant: primary | secondary | ghost | danger | danger-text
export default function Button({
  variant = "primary",
  full = false,
  small = false,
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}) {
  const classes = [
    styles.button,
    styles[variant],
    full && styles.full,
    small && styles.small,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type="button" className={classes} disabled={disabled || loading} {...rest}>
      {loading ? <Spinner inline delay={0} /> : children}
    </button>
  );
}
