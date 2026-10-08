import { useEffect, useState } from "react";
import { applyTheme, getTheme, toggleTheme, type Theme } from "../lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = getTheme();
    setTheme(current);
    applyTheme(current);
  }, []);

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light" : "Dark"}
      onClick={() => setTheme((value) => toggleTheme(value))}
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.5 13.5A6.5 6.5 0 0 1 10 5a7 7 0 1 0 9.5 9.5 6.5 6.5 0 0 1-4-1Z" />
        </svg>
      )}
    </button>
  );
}
