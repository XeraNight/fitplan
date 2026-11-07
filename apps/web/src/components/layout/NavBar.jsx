import { NavLink, useLocation } from "react-router-dom";
import styles from "./NavBar.module.css";

const ICONS = {
  list: <path d="M5 6h14M5 12h14M5 18h9" />,
};

// Tabs grow per sprint (Technical Design §1.3): Sprint 2 adds Workout and History,
// Sprint 3 adds Progress. A tab appears only when its page works.
export const TABS = [{ to: "/routines", label: "Routines", icon: "list" }];

export default function NavBar() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/workout")) return null; // focus mode during a workout

  return (
    <nav className={styles.nav} aria-label="Main">
      <span className={styles.brand}>
        <img src="/favicon.svg" alt="" width="28" height="28" />
        <span className={styles.word}>
          Fit<span>Plan</span>
        </span>
      </span>
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ""}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {ICONS[tab.icon]}
          </svg>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
