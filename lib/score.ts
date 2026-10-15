import type { Difficulty, GameMode, ScoreBreakdown } from "@/lib/types";

const DIFFICULTY_BONUS: Record<Difficulty, number> = {
  easy: 200,
  medium: 500,
  hard: 900,
  extreme: 1400,
};

const BASE = 1000;

export function scoreCeiling(difficulty: Difficulty) {
  return BASE + DIFFICULTY_BONUS[difficulty];
}

export function scoreRun(input: {
  mode: GameMode;
  difficulty: Difficulty;
  clicks: number;
  timeMs: number;
}): ScoreBreakdown {
  const base = BASE;
  const difficultyBonus = DIFFICULTY_BONUS[input.difficulty];
  const ceiling = base + difficultyBonus;
  const seconds = Math.max(0, input.timeMs) / 1000;
  const clickWeight = input.mode === "speed" ? 20 : input.mode === "fewest" ? 80 : 45;
  const timeWeight = input.mode === "fewest" ? 1 : input.mode === "speed" ? 12 : 4;
  const clickPenalty = Math.round(input.clicks * clickWeight);
  const timePenalty = Math.round(seconds * timeWeight);
  const total = Math.max(0, ceiling - clickPenalty - timePenalty);
  return { base, difficultyBonus, clickPenalty, timePenalty, total, ceiling };
}

/** 0–100 how much of the max score you kept. */
export function scorePercent(score: Pick<ScoreBreakdown, "total" | "ceiling">) {
  if (score.ceiling <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((score.total / score.ceiling) * 100)));
}
