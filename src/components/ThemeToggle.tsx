"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "kelime-merdiveni-theme";

type ThemeChoice = "light" | "dark";

function applyTheme(theme: ThemeChoice) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function readStoredTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage kullanılamıyorsa varsayılan koyu tema
  }
  return "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeChoice>("dark");

  useEffect(() => {
    const stored = readStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const toggleTheme = () => {
    const next: ThemeChoice = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // localStorage kullanılamıyorsa yine de temayı uygula
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-ladder-border text-lg transition hover:border-ladder-text"
      aria-label={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
