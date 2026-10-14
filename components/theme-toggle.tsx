"use client";

import { useSyncExternalStore } from "react";

type Theme = "system" | "dark" | "light";

const ORDER: Theme[] = ["system", "dark", "light"];
const STORAGE_KEY = "speedwikipedia-theme";
const THEME_EVENT = "speedwikipedia-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme === "light") root.classList.add("light");
  if (theme === "dark") root.classList.add("dark");
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function readTheme(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "dark" || stored === "light" || stored === "system" ? stored : "system";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as const);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length] ?? "system";
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="pressable inline-flex h-9 shrink-0 items-center rounded-lg border border-line bg-card px-2.5 text-sm font-semibold text-ink shadow-[0_1px_0_rgb(0_0_0/4%)] hover:bg-soft sm:h-10 sm:rounded-xl sm:px-3"
      aria-label={`Theme: ${theme}. Change theme.`}
    >
      {theme === "system" ? "Auto" : theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
