import { GAME_MODES, type GameMode } from "@/lib/types";

export const MODE_META: Record<
  GameMode,
  { label: string; detail: string; limit: number | null }
> = {
  classic: {
    label: "Classic",
    detail: "No click limit. The score blends time and clicks.",
    limit: null,
  },
  fewest: {
    label: "Fewest clicks",
    detail: "Clicks matter most. Time is a tiebreaker.",
    limit: null,
  },
  speed: {
    label: "Speedrun",
    detail: "The clock matters most.",
    limit: null,
  },
  five: {
    label: "5 clicks",
    detail: "Reach the target before the fifth click runs out.",
    limit: 5,
  },
  ten: {
    label: "10 clicks",
    detail: "Ten clicks, then the run ends.",
    limit: 10,
  },
};

export function parseMode(value: string): GameMode {
  return GAME_MODES.includes(value as GameMode) ? (value as GameMode) : "classic";
}
