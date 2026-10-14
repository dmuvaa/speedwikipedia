import { ButtonLink } from "@/components/button";
import type { Challenge } from "@/lib/types";
import { labelDifficulty, playHref } from "@/lib/titles";

export function ChallengeRow({
  challenge,
  showDifficulty = true,
}: {
  challenge: Challenge;
  showDifficulty?: boolean;
}) {
  return (
    <article
      className={`grid gap-3 px-3 py-4 sm:items-center sm:gap-5 sm:px-5 ${
        showDifficulty
          ? "sm:grid-cols-[auto_minmax(0,1fr)_auto]"
          : "sm:grid-cols-[minmax(0,1fr)_auto]"
      }`}
    >
      {showDifficulty ? (
        <span className="inline-flex min-h-8 w-fit items-center rounded-lg border border-line bg-soft px-2.5 text-xs font-semibold text-ink">
          {labelDifficulty(challenge.difficulty)}
        </span>
      ) : null}
      <div className="min-w-0">
        <h3 className="font-serif text-lg leading-snug font-semibold sm:text-2xl sm:leading-tight">
          <span className="text-ink">{challenge.start}</span>
          <span className="mx-1.5 text-muted sm:mx-2" aria-hidden="true">
            →
          </span>
          <span className="text-ink">{challenge.target}</span>
        </h3>
        <p className="mt-1 text-sm text-muted">{challenge.category}</p>
      </div>
      <ButtonLink
        href={playHref({
          start: challenge.start,
          target: challenge.target,
          mode: "classic",
          difficulty: challenge.difficulty,
        })}
        className="w-full sm:min-w-24 sm:w-auto"
      >
        Play
      </ButtonLink>
    </article>
  );
}
