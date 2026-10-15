"use client";

import { useSyncExternalStore } from "react";
import { HowToPlayTour } from "@/components/how-to-play-tour";
import { INTRO_KEY } from "@/lib/stats";

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
  const hide = useSyncExternalStore(subscribe, dismissed, () => true);

  if (hide) return null;

  return <HowToPlayTour autoStart onClose={markSeen} />;
}
