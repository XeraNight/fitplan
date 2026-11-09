import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext.jsx";
import { wakeUpServices } from "../api/authApi.js";
import ErrorMessage from "../components/ui/ErrorMessage.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [waking, setWaking] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // Start the backend functions while the user looks at this page, so signing in is fast.
  useEffect(() => {
    const slow = setTimeout(() => setWaking(true), 1500);
    wakeUpServices()
      .catch(() => {})
      .finally(() => {
        clearTimeout(slow);
        setWaking(false);
      });
    return () => clearTimeout(slow);
  }, []);

  if (user) return <Navigate to={location.state?.from ?? "/routines"} replace />;

  const onSuccess = async ({ credential }) => {
    setError(null);
    setSigningIn(true);
    try {
      await login(credential);
      navigate(location.state?.from ?? "/routines", { replace: true });
    } catch (err) {
      setError(err);
      setSigningIn(false);
    }
  };

  return (
    <main className={styles.page}>
      <img className={styles.logo} src="/favicon.svg" alt="" width="88" height="88" />
      <h1>
        Fit<span>Plan</span>
      </h1>
      <p className={styles.vision}>
        Log every set in seconds.
        <br />
        See when you beat your best.
      </p>

      <div className={styles.button}>
        {signingIn ? (
          <Spinner delay={0} label="Signing in" />
        ) : (
          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => setError({ code: "GOOGLE_TOKEN_INVALID" })}
            theme="filled_black"
            shape="rectangular"
            text="signin_with"
            width="260"
          />
        )}
      </div>

      <ErrorMessage error={error} />
      {waking && (
        <p className={styles.wake}>
          <Spinner inline delay={0} /> Connecting to the server…
        </p>
      )}
      <a className={styles.privacy} href="/privacy">
        Privacy policy
      </a>
    </main>
  );
}
