import { CHALLENGES } from "@/lib/challenges";

export function utcDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function shiftDateKey(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function challengeForDate(date: Date) {
  const day = Math.floor(date.getTime() / 86_400_000);
  const index = ((day % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length;
  return CHALLENGES[index] ?? CHALLENGES[0];
}

export function formatUtcDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}
