import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../ui/Button.jsx";
import NavBar from "./NavBar.jsx";
import styles from "./AppShell.module.css";

// Page frame: header (back link, title, avatar with sign-out), content, tab bar.
// bottomAction = the main action of the screen, fixed in the thumb zone.
export default function AppShell({ title, backTo, bottomAction, children }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <NavBar />
      <div className={styles.page}>
        <header className={styles.header}>
          {backTo && (
            <Link to={backTo} className={styles.back} aria-label="Back">
              ‹
            </Link>
          )}
          <h1>{title}</h1>
          {user && (
            <div className={styles.account}>
              <button
                type="button"
                className={styles.avatar}
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Account"
                aria-expanded={menuOpen}
              >
                {user.picture ? (
                  <img src={user.picture} alt="" referrerPolicy="no-referrer" />
                ) : (
                  (user.name ?? "?").charAt(0)
                )}
              </button>
              {menuOpen && (
                <div className={styles.menu}>
                  <p>{user.name}</p>
                  <small>{user.email}</small>
                  <Button variant="secondary" small full onClick={logout}>
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          )}
        </header>
        <main className={styles.content}>{children}</main>
        {bottomAction && <div className={styles.bottom}>{bottomAction}</div>}
      </div>
    </div>
  );
}
