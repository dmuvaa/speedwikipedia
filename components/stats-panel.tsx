"use client";

import { useId, useSyncExternalStore } from "react";
import { utcDateKey } from "@/lib/daily";
import { MODE_META } from "@/lib/modes";
import { formatClock, formatPrecise, formatScore, pluralClicks } from "@/lib/format";
import { ButtonLink } from "@/components/button";
import { parseStats, statsServerSnapshot, statsSnapshot, streakFrom, subscribeStats } from "@/lib/stats";

export function StatsPanel() {
  const raw = useSyncExternalStore(subscribeStats, statsSnapshot, statsServerSnapshot);
  const stats = parseStats(raw);
  const streak = raw ? streakFrom(stats.daily, utcDateKey(new Date())) : 0;

  const bests = Object.values(stats.bests)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const winRate = stats.played === 0 ? "—" : `${Math.round((stats.won / stats.played) * 100)}%`;

  return (
    <div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Games" value={String(stats.played)} />
        <Stat label="Wins" value={String(stats.won)} />
        <Stat label="Win rate" value={winRate} />
        <Stat label="Best score" value={stats.bestScore ? formatScore(stats.bestScore) : "—"} />
        <Stat label="Best time" value={stats.bestTimeMs == null ? "—" : formatPrecise(stats.bestTimeMs)} />
        <Stat label="Fewest clicks" value={stats.fewestClicks == null ? "—" : String(stats.fewestClicks)} />
        <Stat label="Daily streak" value={streak === 1 ? "1 day" : `${streak} days`} />
      </dl>

      <h2 className="mt-8 font-serif text-xl font-semibold tracking-tight sm:mt-10 sm:text-2xl">
        Best finishes
      </h2>
      {bests.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Play a round and your results will show up here.</p>
      ) : (
        <ol className="mt-4 divide-y divide-line border-y border-line">
          {bests.map((best) => (
            <li key={`${best.start}-${best.target}-${best.mode}`} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <div>
                <p className="font-medium">
                  {best.start} to {best.target}
                </p>
                <p className="text-sm text-muted">
                  {MODE_META[best.mode].label} · {pluralClicks(best.clicks)} · {formatClock(best.timeMs)}
                </p>
              </div>
              <p className="tabular-nums">{formatScore(best.score)}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8">
        <ButtonLink href="/challenges" variant="secondary">
          Browse challenges
        </ButtonLink>
      </div>
    </div>
  );
}

export function StreakNote() {
  const raw = useSyncExternalStore(subscribeStats, statsSnapshot, statsServerSnapshot);
  const streak = raw ? streakFrom(parseStats(raw).daily, utcDateKey(new Date())) : 0;
  if (!raw) return <p className="text-sm text-muted">Streak on this device: 0 days.</p>;
  return (
    <p className="text-sm text-muted">
      Streak on this device: {streak === 1 ? "1 day" : `${streak} days`}.
    </p>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const id = useId();
  return (
    <div className="rounded-2xl border border-line bg-card px-4 py-4">
      <dt id={id} className="text-xs font-medium text-muted">
        {label}
      </dt>
      <dd aria-labelledby={id} className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
        {value}
      </dd>
    </div>
  );
}
