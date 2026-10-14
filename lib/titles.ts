import type { Difficulty, GameMode } from "@/lib/types";

const NAMESPACES = new Set([
  "special",
  "file",
  "image",
  "media",
  "wikipedia",
  "wp",
  "help",
  "portal",
  "template",
  "category",
  "talk",
  "user",
  "user talk",
  "wikipedia talk",
  "module",
  "draft",
  "timedtext",
  "book",
  "mediawiki",
  "mos",
  "topic",
  "project",
  "project talk",
  "file talk",
  "template talk",
  "help talk",
  "category talk",
  "portal talk",
  "draft talk",
  "module talk",
]);

export function articleKey(title: string) {
  let value = title.trim().replace(/\+/g, " ");
  try {
    value = decodeURIComponent(value);
  } catch {
    // Keep the raw title when it is not valid percent-encoding.
  }
  value = value.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  const hash = value.indexOf("#");
  if (hash !== -1) value = value.slice(0, hash).trim();
  return value;
}

export function titlesMatch(a: string, b: string) {
  return articleKey(a).toLocaleLowerCase() === articleKey(b).toLocaleLowerCase();
}

export function isMainspaceTitle(title: string) {
  const cleaned = articleKey(title);
  const colon = cleaned.indexOf(":");
  if (colon <= 0) return true;
  const prefix = cleaned.slice(0, colon).trim().toLocaleLowerCase();
  return !NAMESPACES.has(prefix);
}

export function isPlayableTitle(title: string) {
  const cleaned = articleKey(title);
  if (cleaned.length < 1 || cleaned.length > 200) return false;
  if (/[<>[\]{}|#]/.test(cleaned)) return false;
  if (/[\u0000-\u001f]/.test(cleaned)) return false;
  return isMainspaceTitle(cleaned);
}

export function wikiPageUrl(title: string) {
  const slug = articleKey(title).replace(/ /g, "_");
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
}

export function firstParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

export function playHref(input: {
  start: string;
  target: string;
  mode?: GameMode;
  difficulty?: Difficulty;
  guide?: boolean;
}) {
  const params = new URLSearchParams();
  params.set("from", input.start);
  params.set("to", input.target);
  if (input.mode) params.set("mode", input.mode);
  if (input.difficulty) params.set("difficulty", input.difficulty);
  if (input.guide) params.set("guide", "1");
  return `/play?${params.toString()}`;
}

export function labelDifficulty(difficulty: Difficulty) {
  if (difficulty === "extreme") return "Extra hard";
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}
