"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { formatClock, formatPrecise, formatScore, pluralClicks } from "@/lib/format";
import { MODE_META } from "@/lib/modes";
import { scorePercent } from "@/lib/score";
import { challengeShareText, resultShareText, shareLinks } from "@/lib/share";
import type { GameMode, PathStep, PersonalBest, ScoreBreakdown } from "@/lib/types";

export function ResultPanel({
  won,
  reason,
  start,
  target,
  clicks,
  limit,
  timeMs,
  score,
  path,
  mode,
  previousBest,
  shareUrl,
  onReplay,
  onNext,
}: {
  won: boolean;
  reason: "clicks" | "giveup" | null;
  start: string;
  target: string;
  clicks: number;
  limit: number | null;
  timeMs: number;
  score: ScoreBreakdown | null;
  path: PathStep[];
  mode: GameMode;
  previousBest: PersonalBest | null;
  shareUrl: string;
  onReplay: () => void;
  onNext: () => void;
}) {
  const text = won
    ? resultShareText({ start, target, clicks, timeMs })
    : challengeShareText(start, target);
  const reached = path[path.length - 1]?.title ?? start;
  const bestNote = !won
    ? null
    : !previousBest
      ? "First finish on this device."
      : score && score.total > previousBest.score
        ? "New personal best"
        : `Best: ${pluralClicks(previousBest.clicks)} · ${formatPrecise(previousBest.timeMs)} · ${formatScore(previousBest.score)}`;

  return (
    <div className="win-pop mx-auto flex w-full max-w-lg flex-col gap-3 pb-6 text-ink sm:gap-4">
      <div
        className={`rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 ${
          won
            ? "border-[color-mix(in_srgb,var(--signal)_40%,var(--line))] bg-card"
            : "border-line bg-card"
        }`}
      >
        <p className={`text-sm font-semibold ${won ? "text-signal" : "text-muted"}`}>
          {won ? "Target reached" : "Run over"}
        </p>
        <h1 className="mt-1 font-serif text-3xl leading-tight font-semibold text-ink sm:text-4xl">
          {won ? target : "Game over"}
        </h1>
        <p className="mt-2 text-sm leading-snug text-muted sm:text-base">
          {won
            ? `${start} → ${target}`
            : reason === "giveup"
              ? `Stopped at ${reached}`
              : `Out of clicks · target was ${target}`}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        <Stat label="Clicks" value={limit == null ? String(clicks) : `${clicks}/${limit}`} />
        <Stat label="Time" value={formatPrecise(timeMs)} />
      </dl>

      {score && won ? <ScoreBar score={score} /> : null}

      {(bestNote || !won) && (
        <p className={`text-sm ${bestNote === "New personal best" ? "font-semibold text-signal" : "text-muted"}`}>
          {bestNote ?? `${MODE_META[mode].label}. You reached ${reached}.`}
        </p>
      )}

      <div className="flex gap-2">
        <Button onClick={onReplay} className="min-h-11 flex-1">
          Play again
        </Button>
        <Button variant="secondary" onClick={onNext} className="min-h-11 flex-1">
          Next
        </Button>
      </div>

      <section className="min-h-0">
        <h2 className="text-sm font-semibold text-ink">Your path · {path.length} hops</h2>
        <ol className="mt-2 max-h-[28vh] overflow-y-auto rounded-xl border border-line bg-card px-3 py-2 sm:max-h-none sm:overflow-visible">
          {path.map((step, index) => {
            const last = index === path.length - 1;
            return (
              <li
                key={`${step.title}-${index}`}
                className={`flex items-baseline justify-between gap-3 border-b border-line/70 py-2 text-sm last:border-0 ${
                  last ? "font-semibold text-ink" : "text-muted"
                }`}
              >
                <span className="min-w-0 truncate">{step.title}</span>
                <time className="shrink-0 text-xs tabular-nums text-muted">{formatClock(step.atMs)}</time>
              </li>
            );
          })}
        </ol>
      </section>

      <ShareBox text={text} url={shareUrl} />

      {won ? (
        <p className="text-xs text-muted">
          <a
            className="font-medium text-accent underline underline-offset-2"
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(target.replace(/ /g, "_"))}`}
            target="_blank"
            rel="noreferrer"
          >
            {target} on Wikipedia
          </a>
          <span> · CC BY-SA 4.0</span>
        </p>
      ) : null}
    </div>
  );
}

function ScoreBar({ score }: { score: ScoreBreakdown }) {
  const percent = scorePercent(score);
  const lostToClicks = score.clickPenalty;
  const lostToTime = score.timePenalty;

  return (
    <div className="rounded-2xl border border-line bg-card px-4 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-ink">Run score</p>
        <p className="text-sm tabular-nums text-muted">
          <span className="font-bold text-ink">{formatScore(score.total)}</span>
          <span aria-hidden="true"> / </span>
          <span className="sr-only"> out of </span>
          {formatScore(score.ceiling)}
        </p>
      </div>
      <div
        className="mt-3 h-3 overflow-hidden rounded-full bg-soft"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={score.ceiling}
        aria-valuenow={score.total}
        aria-label={`Score ${formatScore(score.total)} of ${formatScore(score.ceiling)}`}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted">
        You kept <strong className="font-semibold text-ink">{percent}%</strong> of the max for this
        difficulty. Fewer clicks and a faster finish fill the bar.
      </p>
      {(lostToClicks > 0 || lostToTime > 0) && (
        <p className="mt-1.5 text-xs text-muted">
          Lost {lostToClicks > 0 ? `${formatScore(lostToClicks)} to clicks` : null}
          {lostToClicks > 0 && lostToTime > 0 ? " · " : null}
          {lostToTime > 0 ? `${formatScore(lostToTime)} to time` : null}
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-2.5 py-2.5 sm:px-3 ${
        highlight
          ? "border-[color-mix(in_srgb,var(--signal)_40%,var(--line))] bg-[color-mix(in_srgb,var(--signal)_12%,var(--card))]"
          : "border-line bg-card"
      }`}
    >
      <dt className="text-[0.7rem] font-semibold text-muted">{label}</dt>
      <dd
        className={`mt-0.5 text-xl font-bold tracking-tight tabular-nums sm:text-2xl ${
          highlight ? "text-signal" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function ShareBox({ text, url }: { text: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const full = url ? `${text}\n${url}` : text;

  return (
    <div className="rounded-xl border border-line bg-card p-3">
      <p className="text-sm font-semibold text-ink">Share</p>
      <pre className="mt-2 max-h-24 overflow-y-auto whitespace-pre-wrap break-all font-sans text-xs leading-5 text-muted sm:text-sm">
        {full}
      </pre>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="min-h-10"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(full);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
        {url
          ? shareLinks(text, url).map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="pressable inline-flex min-h-10 items-center rounded-xl border border-line bg-card px-3 text-sm font-semibold text-ink hover:bg-soft"
              >
                {link.label}
              </a>
            ))
          : null}
      </div>
    </div>
  );
}
