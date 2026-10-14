"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { BEGINNER } from "@/lib/challenges";
import { INTRO_KEY } from "@/lib/stats";
import { playHref } from "@/lib/titles";

const INTRO_EVENT = "speedwikipedia-intro";

function subscribe(callback: () => void) {
  window.addEventListener(INTRO_EVENT, callback);
  return () => window.removeEventListener(INTRO_EVENT, callback);
}

function dismissed() {
  return window.localStorage.getItem(INTRO_KEY) === "1";
}

function markSeen() {
  window.localStorage.setItem(INTRO_KEY, "1");
  window.dispatchEvent(new Event(INTRO_EVENT));
}

export function Onboarding() {
  const router = useRouter();
  const hide = useSyncExternalStore(subscribe, dismissed, () => true);

  function start() {
    markSeen();
    router.push(
      playHref({
        start: BEGINNER.start,
        target: BEGINNER.target,
        mode: "classic",
        difficulty: BEGINNER.difficulty,
        guide: true,
      }),
    );
  }

  if (hide) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 p-4 sm:items-center"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-title"
        className="rise-in w-full max-w-md rounded-2xl surface p-6"
        onKeyDown={(event) => {
          if (event.key === "Escape") markSeen();
        }}
      >
        <p className="text-sm font-semibold text-accent">First race</p>
        <h2 id="intro-title" className="display-tight mt-3 font-serif text-3xl font-semibold sm:text-4xl">
          Get from one article to another.
        </h2>
        <ul className="mt-5 space-y-2 text-sm leading-6 text-muted">
          <li>You can only click Wikipedia links.</li>
          <li>No search. No shortcuts.</li>
          <li>Reach the target — fewer hops win.</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            autoFocus
            onClick={start}
            className="pressable inline-flex min-h-11 items-center rounded-xl border border-accent bg-accent px-5 text-sm font-semibold text-accent-ink shadow-[0_1px_0_rgb(0_0_0/8%)]"
          >
            Start playing
          </button>
          <button
            type="button"
            onClick={markSeen}
            className="pressable inline-flex min-h-11 items-center rounded-xl border border-line bg-card px-4 text-sm font-semibold text-ink shadow-[0_1px_0_rgb(0_0_0/4%)] hover:bg-soft"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
