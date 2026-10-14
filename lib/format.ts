export function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatPrecise(ms: number) {
  return `${(Math.max(0, ms) / 1000).toFixed(1)}s`;
}

export function formatScore(score: number) {
  return score.toLocaleString("en-US");
}

export function pluralClicks(clicks: number) {
  return `${clicks} ${clicks === 1 ? "click" : "clicks"}`;
}
