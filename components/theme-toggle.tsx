"use client";

import { useSyncExternalStore } from "react";

type Theme = "system" | "dark" | "light";

const ORDER: Theme[] = ["system", "light", "dark"];
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

const LABELS: Record<Theme, string> = {
  system: "Auto",
  light: "Light",
  dark: "Dark",
};

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
      className="pressable inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-line bg-card px-3 text-sm font-semibold text-ink shadow-[0_1px_0_rgb(0_0_0/4%)] hover:bg-soft"
      aria-label={`Theme: ${LABELS[theme]}. Change theme.`}
      title="Cycle light / dark / auto"
    >
      <ThemeGlyph theme={theme} />
      <span>{LABELS[theme]}</span>
    </button>
  );
}

function ThemeGlyph({ theme }: { theme: Theme }) {
  if (theme === "dark") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className="text-ink">
        <path
          fill="currentColor"
          d="M6 1.5a6.5 6.5 0 1 0 8.1 8.9A5.5 5.5 0 1 1 6 1.5Z"
        />
      </svg>
    );
  }
  if (theme === "light") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className="text-ink">
        <circle cx="8" cy="8" r="3" fill="currentColor" />
        <path
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className="text-ink">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path fill="currentColor" d="M8 2a6 6 0 0 1 0 12V2Z" />
    </svg>
  );
}
