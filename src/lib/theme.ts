export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

export const isTheme = (value: string | null): value is Theme => {
  return value === "light" || value === "dark";
};

export const resolveInitialTheme = (): Theme => {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (isTheme(stored)) {
    return stored;
  }

  return "light";
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
};

export const setThemePreference = (theme: Theme) => {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent<Theme>("themechange", { detail: theme }));
};

export const initializeTheme = (): Theme => {
  const nextTheme = resolveInitialTheme();
  applyTheme(nextTheme);
  return nextTheme;
};