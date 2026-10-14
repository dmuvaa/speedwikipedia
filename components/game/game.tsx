"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArticleSkeleton, ArticleView } from "@/components/game/article-view";
import { PathList } from "@/components/game/path-list";
import { ResultPanel } from "@/components/game/result-panel";
import { Button, ButtonLink } from "@/components/button";
import { articleErrorCopy } from "@/lib/copy";
import { formatClock, pluralClicks } from "@/lib/format";
import { MODE_META } from "@/lib/modes";
import { fetchArticleWithRetry, loadCachedArticle, warmArticle } from "@/lib/article-cache";
import { pickQuickChallenge } from "@/lib/challenges";
import { scoreRun } from "@/lib/score";
import { readBest, recordFinish, recordStart } from "@/lib/stats";
import { absoluteUrl } from "@/lib/site";
import { playHref, titlesMatch } from "@/lib/titles";
import type { Article, Difficulty, GameMode, PathStep, PersonalBest, ScoreBreakdown } from "@/lib/types";

type Phase = "loading" | "playing" | "won" | "lost" | "error";
type LoseReason = "clicks" | "giveup" | null;

export function Game(props: {
  start: string;
  target: string;
  mode: GameMode;
  difficulty: Difficulty;
  category: string | null;
  guide: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  const id = `${props.start}|${props.target}|${props.mode}|${props.difficulty}`;
  return (
    <GameSession
      key={`${id}:${attempt}`}
      {...props}
      onReplay={() => setAttempt((value) => value + 1)}
    />
  );
}

function GameSession({
  start,
  target,
  mode,
  difficulty,
  category,
  guide,
  onReplay,
}: {
  start: string;
  target: string;
  mode: GameMode;
  difficulty: Difficulty;
  category: string | null;
  guide: boolean;
  onReplay: () => void;
}) {
  const router = useRouter();
  const limit = MODE_META[mode].limit;
  const [phase, setPhase] = useState<Phase>("loading");
  const [article, setArticle] = useState<Article | null>(null);
  const [targetTitle, setTargetTitle] = useState(target);
  const [path, setPath] = useState<PathStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [frozen, setFrozen] = useState<number | null>(null);
  const [scrollHash, setScrollHash] = useState<string | null>(null);
  const [score, setScore] = useState<ScoreBreakdown | null>(null);
  const [previousBest, setPreviousBest] = useState<PersonalBest | null>(null);
  const [loseReason, setLoseReason] = useState<LoseReason>(null);
  const [pathOpen, setPathOpen] = useState(false);
  const [giveUpOpen, setGiveUpOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(guide);
  const [reloadKey, setReloadKey] = useState(0);
  const recorded = useRef(false);
  const started = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  const pendingNav = useRef<{ title: string; hash: string | null } | null>(null);
  const navigating = useRef(false);
  const pathRef = useRef(path);
  const articleRef = useRef(article);
  const phaseRef = useRef(phase);
  const startedAtRef = useRef(startedAt);
  const targetTitleRef = useRef(targetTitle);

  const clicks = Math.max(0, path.length - 1);
  const shownTime = frozen ?? elapsed;
  const startTitle = path[0]?.title ?? start;
  const shareUrl =
    phase === "won" || phase === "lost"
      ? absoluteUrl(playHref({ start: startTitle, target: targetTitle, mode, difficulty }))
      : "";

  useEffect(() => {
    pathRef.current = path;
    articleRef.current = article;
    phaseRef.current = phase;
    startedAtRef.current = startedAt;
    targetTitleRef.current = targetTitle;
  }, [path, article, phase, startedAt, targetTitle]);

  useEffect(() => {
    if (phase !== "playing" || startedAt == null) return;
    const id = window.setInterval(() => setElapsed(Date.now() - startedAt), 200);
    return () => window.clearInterval(id);
  }, [phase, startedAt]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const startArticle = await loadCachedArticle(start, () =>
          fetchArticle(start, AbortSignal.timeout(20_000)),
        );
        if (cancelled) return;
        if (titlesMatch(startArticle.title, target)) {
          setError("same");
          setPhase("error");
          return;
        }
        setArticle(startArticle);
        setTargetTitle(target);
        setPath([{ title: startArticle.title, atMs: 0 }]);
        setStartedAt(Date.now());
        setPhase("playing");
        if (!started.current) {
          started.current = true;
          recordStart();
        }
        warmArticle(target, () => fetchArticle(target));
      } catch (loadError) {
        if (cancelled) return;
        const code =
          loadError instanceof DOMException && loadError.name === "AbortError"
            ? "upstream"
            : loadError instanceof Error
              ? loadError.message
              : "upstream";
        setError(code);
        setPhase("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [start, target, reloadKey]);

  function finish(won: boolean, finalClicks: number, timeMs: number, reason: LoseReason = null) {
    if (recorded.current) return;
    recorded.current = true;
    const breakdown = won ? scoreRun({ mode, difficulty, clicks: finalClicks, timeMs }) : null;
    const previous = readBest(startTitle, targetTitle, mode);
    setPreviousBest(previous);
    setFrozen(timeMs);
    setScore(breakdown);
    setLoseReason(reason);
    recordFinish({
      start: startTitle,
      target: targetTitle,
      mode,
      won,
      clicks: finalClicks,
      timeMs,
      score: breakdown?.total ?? 0,
      countsAsDaily: won,
    });
    setPhase(won ? "won" : "lost");
    setPathOpen(false);
    setGiveUpOpen(false);
    scroller.current?.scrollTo({ top: 0 });
  }

  async function navigate(title: string, hash: string | null) {
    if (phaseRef.current !== "playing" || !articleRef.current) return;
    if (titlesMatch(title, articleRef.current.title)) {
      setScrollHash(hash);
      return;
    }
    if (navigating.current) {
      pendingNav.current = { title, hash };
      return;
    }

    navigating.current = true;
    setPending(true);
    setBanner(null);
    try {
      const next = await fetchArticleWithRetry(title, () => fetchArticle(title));
      if (phaseRef.current !== "playing") return;
      const atMs = startedAtRef.current == null ? 0 : Date.now() - startedAtRef.current;
      const nextPath = [...pathRef.current, { title: next.title, atMs }];
      const nextClicks = nextPath.length - 1;
      articleRef.current = next;
      pathRef.current = nextPath;
      setArticle(next);
      setPath(nextPath);
      setScrollHash(hash);
      if (!hash) scroller.current?.scrollTo({ top: 0 });
      if (titlesMatch(next.title, targetTitleRef.current)) {
        finish(true, nextClicks, atMs);
        return;
      }
      if (limit != null && nextClicks >= limit) {
        finish(false, nextClicks, atMs, "clicks");
      }
    } catch (navError) {
      const code =
        navError instanceof DOMException && navError.name === "AbortError"
          ? "upstream"
          : navError instanceof Error
            ? navError.message
            : "upstream";
      setBanner(articleErrorCopy(code));
    } finally {
      navigating.current = false;
      setPending(false);
      const queued = pendingNav.current;
      pendingNav.current = null;
      if (queued && phaseRef.current === "playing") {
        window.setTimeout(() => {
          void navigate(queued.title, queued.hash);
        }, 0);
      }
    }
  }

  function giveUp() {
    const timeMs = startedAt == null ? shownTime : Date.now() - startedAt;
    finish(false, clicks, timeMs, "giveup");
  }

  function nextChallenge() {
    const challenge = pickQuickChallenge();
    router.push(
      playHref({
        start: challenge.start,
        target: challenge.target,
        mode,
        difficulty: challenge.difficulty,
      }),
    );
  }

  return (
    <div data-screen="game" className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper">
      <header className="hud-glass z-20 shrink-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
          <p className="min-w-0 truncate text-sm text-muted sm:text-[0.95rem]">
            {phase === "playing" || phase === "loading" ? (
              <>
                Racing to <strong className="font-semibold text-ink">{targetTitle}</strong>
              </>
            ) : (
              "Run finished"
            )}
          </p>
          <div className="scoreboard shrink-0" aria-live="polite">
            <span className="ticks">{limit == null ? clicks : `${clicks}/${limit}`}</span>
            <span className="text-sm text-muted">{limit == null ? "clicks" : "used"}</span>
            <span className="text-muted" aria-hidden="true">
              ·
            </span>
            <span className="clock">{formatClock(shownTime)}</span>
          </div>
        </div>
        {pending || phase === "loading" ? <div className="load-bar" aria-hidden="true" /> : null}
        {phase === "playing" || phase === "loading" ? (
          <div className="flex items-center gap-2 border-t border-line/70 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5 lg:hidden">
            <span className="shrink-0 text-xs font-medium text-muted">Get to</span>
            <span className="dest-chip min-w-0">
              <strong>{targetTitle}</strong>
            </span>
          </div>
        ) : null}
      </header>

      <div
        className={`flex min-h-0 flex-1 flex-col ${
          phase === "playing" || phase === "loading" ? "lg:grid lg:grid-cols-[minmax(0,1fr)_21rem]" : ""
        }`}
      >
        <div
          ref={scroller}
          className={`min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8 ${
            phase === "playing" || phase === "loading" ? "bg-[#f8f9fa]" : "bg-paper"
          }`}
        >
          <p className="sr-only" aria-live="polite">
            {article
              ? `Now reading ${article.title}. ${pluralClicks(clicks)}.`
              : phase === "error"
                ? articleErrorCopy(error)
                : phase === "won" || phase === "lost"
                  ? "Run finished"
                  : "Loading article"}
          </p>
          <div className={`mx-auto ${phase === "won" || phase === "lost" ? "max-w-xl" : "max-w-3xl"}`}>
            {showGuide && phase === "playing" ? (
              <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-[#c8ccd1] bg-white px-4 py-3 text-sm text-[#202122] shadow-[0_1px_0_rgb(0_0_0/4%)]">
                <p>
                  Tap a blue link to hop. Your finish line is <strong>{targetTitle}</strong>.
                </p>
                <Button variant="secondary" className="shrink-0" onClick={() => setShowGuide(false)}>
                  Got it
                </Button>
              </div>
            ) : null}
            {banner ? (
              <p className="mb-6 rounded-2xl border border-line bg-soft px-4 py-3 text-sm" role="status">
                {banner} The click was not counted.
              </p>
            ) : null}
            {phase === "loading" ? <ArticleSkeleton /> : null}
            {phase === "error" ? (
              <ErrorState
                code={error}
                onRetry={() => {
                  setPhase("loading");
                  setError(null);
                  setReloadKey((value) => value + 1);
                }}
              />
            ) : null}
            {article && phase === "playing" ? (
              <ArticleView
                article={article}
                pending={pending}
                scrollHash={scrollHash}
                onNavigate={(title, hash) => void navigate(title, hash)}
              />
            ) : null}
            {(phase === "won" || phase === "lost") && (
              <ResultPanel
                won={phase === "won"}
                reason={loseReason}
                start={startTitle}
                target={targetTitle}
                clicks={clicks}
                limit={limit}
                timeMs={shownTime}
                score={score}
                path={path}
                mode={mode}
                previousBest={previousBest}
                shareUrl={shareUrl}
                onReplay={onReplay}
                onNext={nextChallenge}
              />
            )}
          </div>
        </div>

        {phase === "playing" || phase === "loading" ? (
          <aside className="hidden border-l border-line/80 bg-card/40 lg:block lg:overflow-y-auto">
            <div className="flex min-h-full flex-col p-5">
              <p className="text-sm font-medium text-muted">Finish line</p>
              <h2 className="mt-2 font-serif text-3xl leading-none font-semibold">{targetTitle}</h2>
              <div className="race-line mt-5">
                <span className="truncate text-sm text-muted">{startTitle}</span>
                <span className="race-track w-10" aria-hidden="true" />
                <span className="truncate text-right text-sm font-medium">{targetTitle}</span>
              </div>
              <p className="mt-4 text-sm text-muted">
                {MODE_META[mode].label}
                {category ? ` · ${category}` : ""}
              </p>
              <h3 className="mt-8 text-sm font-semibold tracking-tight">Path</h3>
              <div className="mt-4">
                <PathList path={path} />
              </div>
              {phase === "playing" ? (
                <Button variant="secondary" className="mt-auto" onClick={() => setGiveUpOpen(true)}>
                  Give up
                </Button>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>

      {phase === "playing" ? (
        <div className="hud-glass grid grid-cols-2 gap-2 border-t border-line/70 p-2 lg:hidden">
          <Button variant="secondary" onClick={() => setPathOpen(true)}>
            Path
          </Button>
          <Button variant="ghost" onClick={() => setGiveUpOpen(true)}>
            Give up
          </Button>
        </div>
      ) : null}

      <SimpleDialog open={pathOpen} title="Path" onClose={() => setPathOpen(false)}>
        <PathList path={path} withTime />
      </SimpleDialog>
      <SimpleDialog open={giveUpOpen} title="Give up this run?" onClose={() => setGiveUpOpen(false)}>
        <p className="text-sm text-muted">The timer stops and this round counts as a loss.</p>
        <div className="mt-5 flex gap-3">
          <Button onClick={giveUp}>Give up</Button>
          <Button variant="secondary" onClick={() => setGiveUpOpen(false)}>
            Keep going
          </Button>
        </div>
      </SimpleDialog>
    </div>
  );
}

function ErrorState({ code, onRetry }: { code: string | null; onRetry: () => void }) {
  return (
    <div className="rise-in rounded-2xl border border-line bg-card p-6 text-ink shadow-[var(--shadow)]">
      <h1 className="display-tight max-w-xl font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        {articleErrorCopy(code)}
      </h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={onRetry}>Try again</Button>
        <ButtonLink href="/challenges" variant="secondary">
          Choose another challenge
        </ButtonLink>
      </div>
    </div>
  );
}

function SimpleDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog ref={ref} className="w-[min(100%-2rem,28rem)] rounded-2xl p-5 text-ink" onClose={onClose}>
      <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-4">{children}</div>
      {title === "Path" ? (
        <Button variant="secondary" className="mt-5" onClick={onClose}>
          Close
        </Button>
      ) : null}
    </dialog>
  );
}

async function fetchArticle(title: string, signal?: AbortSignal) {
  // Prefer the HTTP cache (Cache-Control on /api/article). No hover prefetch —
  // only real clicks and a single idle warm of the target.
  const response = await fetch(
    `/api/article?title=${encodeURIComponent(title)}&v=4`,
    {
      signal,
      headers: { Accept: "application/json" },
    },
  );
  const data = (await response.json().catch(() => null)) as (Article & { error?: string }) | null;
  if (!response.ok || !data || data.error || !data.html) {
    throw new Error(data?.error || "upstream");
  }
  return data;
}
