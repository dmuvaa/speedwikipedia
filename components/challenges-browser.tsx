"use client";

import { useMemo, useState } from "react";
import { ChallengeRow } from "@/components/challenge-row";
import { CATEGORIES, CHALLENGES, challengesByDifficulty } from "@/lib/challenges";
import { DIFFICULTIES, type Difficulty } from "@/lib/types";
import { labelDifficulty } from "@/lib/titles";

export function ChallengesBrowser() {
  const [category, setCategory] = useState("Any");
  const [difficulty, setDifficulty] = useState("Any");

  const groups = useMemo(() => {
    const filtered = CHALLENGES.filter((challenge) => {
      if (category !== "Any" && challenge.category !== category) return false;
      if (difficulty !== "Any" && challenge.difficulty !== difficulty) return false;
      return true;
    });

    if (difficulty !== "Any") {
      return [
        {
          difficulty: difficulty as Difficulty,
          challenges: filtered,
        },
      ];
    }

    return challengesByDifficulty().map((group) => ({
      difficulty: group.difficulty,
      challenges: group.challenges.filter(
        (challenge) => category === "Any" || challenge.category === category,
      ),
    }));
  }, [category, difficulty]);

  const total = groups.reduce((sum, group) => sum + group.challenges.length, 0);

  return (
    <div>
      <div className="flex flex-col gap-5">
        <FilterRow label="Category" value={category} onChange={setCategory} options={["Any", ...CATEGORIES]} />
        <FilterRow
          label="Difficulty"
          value={difficulty}
          onChange={setDifficulty}
          options={["Any", ...DIFFICULTIES]}
          format={(option) =>
            option === "Any" ? option : labelDifficulty(option as (typeof DIFFICULTIES)[number])
          }
        />
      </div>
      <p className="mt-6 text-sm text-muted">
        {total} {total === 1 ? "challenge" : "challenges"}
      </p>
      <div className="mt-4 space-y-8">
        {groups.map((group) =>
          group.challenges.length === 0 ? null : (
            <section key={group.difficulty} aria-labelledby={`difficulty-${group.difficulty}`}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2
                  id={`difficulty-${group.difficulty}`}
                  className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  {labelDifficulty(group.difficulty)}
                </h2>
                <p className="text-sm text-muted">{group.challenges.length}</p>
              </div>
              <div className="divide-y divide-line/80 overflow-hidden rounded-2xl surface">
                {group.challenges.map((challenge) => (
                  <ChallengeRow key={challenge.slug} challenge={challenge} showDifficulty={false} />
                ))}
              </div>
            </section>
          ),
        )}
      </div>
    </div>
  );
}

function FilterRow({
  label,
  value,
  onChange,
  options,
  format = (option) => option,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  format?: (option: string) => string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={`pressable inline-flex min-h-10 items-center rounded-xl border px-3.5 text-sm font-semibold ${
                selected
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-card text-ink shadow-[0_1px_0_rgb(0_0_0/4%)] hover:bg-soft"
              }`}
            >
              {format(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
