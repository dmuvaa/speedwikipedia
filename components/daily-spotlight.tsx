import { connection } from "next/server";
import { ButtonLink } from "@/components/button";
import { challengeForDate, formatUtcDate } from "@/lib/daily";
import { labelDifficulty, playHref } from "@/lib/titles";

export async function DailySpotlight({ detailed = false }: { detailed?: boolean }) {
  await connection();
  const now = new Date();
  const challenge = challengeForDate(now);

  return (
    <section className="surface flex h-full flex-col rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted">Daily · {formatUtcDate(now)} UTC</p>
        <span className="rounded-full bg-soft px-2.5 py-1 text-xs font-medium text-ink">
          {labelDifficulty(challenge.difficulty)}
        </span>
      </div>

      <div className="race-line mt-6">
        <div className="min-w-0">
          <p className="text-xs text-muted">Start</p>
          <p className="mt-1 truncate font-serif text-2xl font-semibold leading-tight sm:text-3xl">
            {challenge.start}
          </p>
        </div>
        <span className="race-track w-10 shrink-0 sm:w-14" aria-hidden="true" />
        <div className="min-w-0 text-right">
          <p className="text-xs text-muted">Target</p>
          <p className="mt-1 truncate font-serif text-2xl font-semibold leading-tight sm:text-3xl">
            {challenge.target}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">{challenge.category}</p>
      {detailed ? (
        <p className="mt-3 max-w-prose text-sm leading-6 text-muted">
          Everyone gets this pair today. Finish it in Classic to keep a streak on this device.
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-3 pt-6">
        <ButtonLink
          href={playHref({
            start: challenge.start,
            target: challenge.target,
            mode: "classic",
            difficulty: challenge.difficulty,
          })}
        >
          Play daily
        </ButtonLink>
        {detailed ? null : (
          <ButtonLink href="/daily" variant="secondary">
            Details
          </ButtonLink>
        )}
      </div>
    </section>
  );
}

export function DailyCardFallback() {
  return (
    <div className="surface animate-pulse rounded-2xl p-6" aria-hidden="true">
      <div className="h-3 w-32 rounded bg-line" />
      <div className="mt-8 h-10 w-3/4 rounded bg-line" />
      <div className="mt-6 h-10 w-2/3 rounded bg-line" />
      <div className="mt-8 h-11 w-28 rounded-full bg-line" />
    </div>
  );
}
