export const DIFFICULTIES = ["easy", "medium", "hard", "extreme"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const GAME_MODES = ["classic", "fewest", "speed", "five", "ten"] as const;

export type GameMode = (typeof GAME_MODES)[number];

export type Challenge = {
  slug: string;
  start: string;
  target: string;
  difficulty: Difficulty;
  category: string;
  featured?: boolean;
  beginner?: boolean;
};

export type Article = {
  title: string;
  description: string | null;
  extract: string | null;
  thumbnail: string | null;
  pageUrl: string;
  html: string;
};

export type ArticleMeta = {
  title: string;
  description: string | null;
  thumbnail: string | null;
  pageUrl: string;
};

export type SearchHit = {
  title: string;
  description: string | null;
};

export type ScoreBreakdown = {
  base: number;
  difficultyBonus: number;
  clickPenalty: number;
  timePenalty: number;
  total: number;
  /** Max possible for this run (base + difficulty). */
  ceiling: number;
};

export type PathStep = {
  title: string;
  atMs: number;
};

export type PersonalBest = {
  start: string;
  target: string;
  mode: GameMode;
  clicks: number;
  timeMs: number;
  score: number;
};
