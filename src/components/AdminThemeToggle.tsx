"use client";

import { useEffect, useState } from "react";
import { initializeTheme, setThemePreference, type Theme } from "@/lib/theme";

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14.9 3.8a8.8 8.8 0 1 0 5.3 15.8A9 9 0 0 1 12.3 4a9 9 0 0 1 2.6-.2Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2Zm0-4.2a.9.9 0 0 1 .9.9v1.4a.9.9 0 1 1-1.8 0V3.9A.9.9 0 0 1 12 3Zm0 15.8a.9.9 0 0 1 .9.9v1.4a.9.9 0 1 1-1.8 0v-1.4a.9.9 0 0 1 .9-.9ZM4 11.1h1.4a.9.9 0 1 1 0 1.8H4a.9.9 0 1 1 0-1.8Zm14.6 0H20a.9.9 0 1 1 0 1.8h-1.4a.9.9 0 1 1 0-1.8ZM6.2 5l1 1a.9.9 0 0 1-1.3 1.3l-1-1A.9.9 0 0 1 6.2 5Zm11.6 11.6 1 1a.9.9 0 1 1-1.3 1.3l-1-1a.9.9 0 1 1 1.3-1.3ZM6.2 19a.9.9 0 0 1-1.3-1.3l1-1a.9.9 0 0 1 1.3 1.3l-1 1Zm11.6-11.6a.9.9 0 0 1-1.3-1.3l1-1a.9.9 0 0 1 1.3 1.3l-1 1Z" />
    </svg>
  );
}

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
      <span className="admin-theme-toggle-icon" aria-hidden="true">
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}