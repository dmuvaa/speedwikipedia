import { challengeForDate, shiftDateKey, utcDateKey } from "@/lib/daily";
import { titlesMatch } from "@/lib/titles";
import type { GameMode, PersonalBest } from "@/lib/types";

const STATS_KEY = "speedwikipedia-stats-v1";
export const INTRO_KEY = "speedwikipedia-intro-v1";

type StoredStats = {
  played: number;
  won: number;
  bestScore: number;
  bestTimeMs: number | null;
  fewestClicks: number | null;
  daily: Record<string, { clicks: number; timeMs: number; score: number }>;
  bests: Record<string, PersonalBest>;
};

const EMPTY: StoredStats = {
  played: 0,
  won: 0,
  bestScore: 0,
  bestTimeMs: null,
  fewestClicks: null,
  daily: {},
  bests: {},
};

export function bestKey(start: string, target: string, mode: GameMode) {
  return `${start.trim().toLocaleLowerCase()}|${target.trim().toLocaleLowerCase()}|${mode}`;
}

export function readStats(): StoredStats {
  if (typeof window === "undefined") return EMPTY;
  return parseStats(statsSnapshot());
}

function writeStats(stats: StoredStats) {
  window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  window.dispatchEvent(new Event("speedwikipedia-stats"));
}

export function subscribeStats(callback: () => void) {
  window.addEventListener("speedwikipedia-stats", callback);
  return () => window.removeEventListener("speedwikipedia-stats", callback);
}

export function statsSnapshot() {
  return window.localStorage.getItem(STATS_KEY) ?? "";
}

export function statsServerSnapshot() {
  return "";
}

export function parseStats(raw: string): StoredStats {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredStats>;
    return {
      ...EMPTY,
      ...parsed,
      daily: parsed.daily ?? {},
      bests: parsed.bests ?? {},
    };
  } catch {
    return EMPTY;
  }
}

export function recordStart() {
  const stats = readStats();
  stats.played += 1;
  writeStats(stats);
}

export function recordFinish(input: {
  start: string;
  target: string;
  mode: GameMode;
  won: boolean;
  clicks: number;
  timeMs: number;
  score: number;
  countsAsDaily: boolean;
}) {
  const stats = readStats();
  if (input.won) {
    stats.won += 1;
    stats.bestScore = Math.max(stats.bestScore, input.score);
    stats.bestTimeMs =
      stats.bestTimeMs == null ? input.timeMs : Math.min(stats.bestTimeMs, input.timeMs);
    stats.fewestClicks =
      stats.fewestClicks == null ? input.clicks : Math.min(stats.fewestClicks, input.clicks);
    const key = bestKey(input.start, input.target, input.mode);
    const previous = stats.bests[key];
    if (!previous || input.score > previous.score) {
      stats.bests[key] = {
        start: input.start,
        target: input.target,
        mode: input.mode,
        clicks: input.clicks,
        timeMs: input.timeMs,
        score: input.score,
      };
    }
    if (input.countsAsDaily && input.mode === "classic") {
      const today = utcDateKey(new Date());
      const daily = challengeForDate(new Date());
      if (titlesMatch(daily.start, input.start) && titlesMatch(daily.target, input.target)) {
        const existing = stats.daily[today];
        if (!existing || input.score > existing.score) {
          stats.daily[today] = {
            clicks: input.clicks,
            timeMs: input.timeMs,
            score: input.score,
          };
        }
      }
    }
  }
  writeStats(stats);
  return stats.bests[bestKey(input.start, input.target, input.mode)] ?? null;
}

export function readBest(start: string, target: string, mode: GameMode) {
  return readStats().bests[bestKey(start, target, mode)] ?? null;
}

export function streakFrom(daily: StoredStats["daily"], today: string) {
  let cursor = daily[today] ? today : shiftDateKey(today, -1);
  let streak = 0;
  while (daily[cursor]) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

export function dailyStreak(today = utcDateKey(new Date())) {
  return streakFrom(readStats().daily, today);
}

export type { StoredStats };
