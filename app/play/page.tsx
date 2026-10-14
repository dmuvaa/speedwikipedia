import { Suspense } from "react";
import Link from "next/link";
import { Game } from "@/components/game/game";
import { ArticleSkeleton } from "@/components/game/article-view";
import { findChallengeByPair, isDifficulty } from "@/lib/challenges";
import { parseMode } from "@/lib/modes";
import { articleKey, firstParam, isPlayableTitle, titlesMatch } from "@/lib/titles";

export const metadata = {
  title: "Play",
};

export default function PlayPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <Suspense fallback={<PlayFallback />}>
      <PlaySession searchParams={searchParams} />
    </Suspense>
  );
}

async function PlaySession({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const from = articleKey(firstParam(params.from) || firstParam(params.start));
  const to = articleKey(firstParam(params.to) || firstParam(params.target));
  const mode = parseMode(firstParam(params.mode));

  if (!from || !to) {
    return <PlayMessage title="Pick a challenge" body="Quick play and the challenge list both drop you into a run." />;
  }
  if (!isPlayableTitle(from) || !isPlayableTitle(to)) {
    return <PlayMessage title="This article is unavailable." body="Choose another challenge." />;
  }
  if (titlesMatch(from, to)) {
    return (
      <PlayMessage
        title="The start and target are the same article."
        body="Choose another challenge."
      />
    );
  }

  const curated = findChallengeByPair(from, to);
  const requested = firstParam(params.difficulty);
  const difficulty = curated?.difficulty ?? (isDifficulty(requested) ? requested : "medium");

  return (
    <Game
      start={from}
      target={to}
      mode={mode}
      difficulty={difficulty}
      category={curated?.category ?? null}
      guide={firstParam(params.guide) === "1"}
    />
  );
}

function PlayFallback() {
  return (
    <div data-screen="game" className="flex min-h-0 flex-1 flex-col px-4 py-8">
      <ArticleSkeleton />
    </div>
  );
}

function PlayMessage({ title, body }: { title: string; body: string }) {
  return (
    <main data-screen="game" className="mx-auto flex min-h-0 flex-1 max-w-xl flex-col justify-center px-4">
      <h1 className="font-serif text-5xl leading-none">{title}</h1>
      <p className="mt-4 text-muted">{body}</p>
      <p className="mt-6 flex gap-4 text-sm">
        <Link href="/" className="underline underline-offset-4">
          Home
        </Link>
        <Link href="/challenges" className="underline underline-offset-4">
          Challenges
        </Link>
      </p>
    </main>
  );
}
