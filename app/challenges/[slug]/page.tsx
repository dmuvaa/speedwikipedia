import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button";
import { CHALLENGES, findChallenge } from "@/lib/challenges";
import { GAME_MODES } from "@/lib/types";
import { MODE_META } from "@/lib/modes";
import { labelDifficulty, playHref } from "@/lib/titles";

export function generateStaticParams() {
  return CHALLENGES.map((challenge) => ({ slug: challenge.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const challenge = findChallenge(slug);
  if (!challenge) return { title: "Challenge" };
  return {
    title: `${challenge.start} to ${challenge.target}`,
    description: `Connect ${challenge.start} to ${challenge.target} using only Wikipedia links. A ${challenge.difficulty} ${challenge.category.toLowerCase()} race on SpeedWikipedia.`,
  };
}

export default function ChallengeRoute({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">Loading challenge…</main>}>
      <ChallengePage params={params} />
    </Suspense>
  );
}

async function ChallengePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const challenge = findChallenge(slug);
  if (!challenge) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <p className="text-sm font-medium text-muted">
        {labelDifficulty(challenge.difficulty)} · {challenge.category}
      </p>

      <div className="mt-4 sm:mt-6">
        <h1 className="font-serif text-3xl leading-tight font-semibold sm:text-5xl">{challenge.start}</h1>
        <p className="mt-2 text-sm text-muted sm:mt-3">to</p>
        <p className="mt-1 font-serif text-3xl leading-tight font-semibold sm:text-5xl">{challenge.target}</p>
      </div>

      <p className="mt-5 max-w-xl text-sm text-muted sm:mt-6 sm:text-base">
        Reach {challenge.target} from {challenge.start} using only links inside Wikipedia articles.
      </p>
      <div className="mt-6 grid gap-2 sm:mt-8 sm:gap-3">
        {GAME_MODES.map((mode) => (
          <div
            key={mode}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium">{MODE_META[mode].label}</p>
              <p className="text-sm text-muted">{MODE_META[mode].detail}</p>
            </div>
            <ButtonLink
              className="w-full sm:w-auto"
              href={playHref({
                start: challenge.start,
                target: challenge.target,
                mode,
                difficulty: challenge.difficulty,
              })}
            >
              Play
            </ButtonLink>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm sm:mt-8">
        <Link href="/challenges" className="underline underline-offset-4 hover:text-accent">
          All challenges
        </Link>
      </p>
    </main>
  );
}
