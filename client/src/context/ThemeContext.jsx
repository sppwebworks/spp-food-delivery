/**
 * ============================================================
 * THEME CONTEXT
 * ============================================================
 */

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // SSR safety check
    if (typeof window === "undefined") return "light";

    // 1. Check localStorage
    const saved =
      localStorage.getItem("theme") || localStorage.getItem("foodie_theme");
    if (saved === "light" || saved === "dark") return saved;

    // 2. Fall back to system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    // 3. Default
    return "light";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Apply to <html> so CSS [data-theme="dark"] selectors work
    document.documentElement.setAttribute("data-theme", theme);

    // Persist to both keys to be safe
    localStorage.setItem("theme", theme);
    localStorage.setItem("foodie_theme", theme);

    // Update browser meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0f1115" : "#ffffff");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setLightTheme = () => setTheme("light");
  const setDarkTheme = () => setTheme("dark");

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setLightTheme, setDarkTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
};

export default ThemeContext;
