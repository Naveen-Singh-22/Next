"use client";

import { useEffect, useState } from "react";
import { initializeTheme, setThemePreference, type Theme } from "@/lib/theme";

// Theme icons replaced by Bootstrap Icons classes

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(initializeTheme());

    const onThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<Theme>;
      if (customEvent.detail === "light" || customEvent.detail === "dark") {
        setTheme(customEvent.detail);
      }
    };

    window.addEventListener("themechange", onThemeChange);
    return () => {
      window.removeEventListener("themechange", onThemeChange);
    };
  }, []);

  const handleToggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setThemePreference(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      className="theme-fab"
      aria-label="Toggle dark mode"
      aria-pressed={theme === "dark"}
      onClick={handleToggle}
    >
      <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"} theme-fab-icon`} aria-hidden="true" />
      <span className="theme-fab-label">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}