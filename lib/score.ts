import type { Difficulty, GameMode, ScoreBreakdown } from "@/lib/types";

const DIFFICULTY_BONUS: Record<Difficulty, number> = {
  easy: 200,
  medium: 500,
  hard: 900,
  extreme: 1400,
};

export function scoreRun(input: {
  mode: GameMode;
  difficulty: Difficulty;
  clicks: number;
  timeMs: number;
}): ScoreBreakdown {
  const base = 1000;
  const difficultyBonus = DIFFICULTY_BONUS[input.difficulty];
  const seconds = Math.max(0, input.timeMs) / 1000;
  const clickWeight = input.mode === "speed" ? 20 : input.mode === "fewest" ? 80 : 45;
  const timeWeight = input.mode === "fewest" ? 1 : input.mode === "speed" ? 12 : 4;
  const clickPenalty = Math.round(input.clicks * clickWeight);
  const timePenalty = Math.round(seconds * timeWeight);
  const total = Math.max(0, base + difficultyBonus - clickPenalty - timePenalty);
  return { base, difficultyBonus, clickPenalty, timePenalty, total };
}
