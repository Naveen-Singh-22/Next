"use client";

import { useEffect, useState } from "react";
import { initializeTheme, setThemePreference, type Theme } from "@/lib/theme";

// Theme icons replaced by Bootstrap Icons classes

export default function AdminThemeToggle() {
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
      className="admin-theme-toggle"
      aria-label="Toggle dark mode"
      aria-pressed={theme === "dark"}
      onClick={handleToggle}
    >
      <i
        className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"} admin-theme-toggle-icon`}
        aria-hidden="true"
      />
    </button>
  );
}