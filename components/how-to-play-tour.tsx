"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/button";
import { BEGINNER } from "@/lib/challenges";
import { playHref } from "@/lib/titles";

type Step = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  demo: ReactNode;
};

const STEPS: Step[] = [
  {
    id: "race",
    eyebrow: "1 · Pick a race",
    title: "Choose where you start and where you finish.",
    body: "Tap Play on a challenge, open Today’s race, or make your own pair. The green button starts the clock.",
    demo: <DemoPickRace />,
  },
  {
    id: "target",
    eyebrow: "2 · Know the finish line",
    title: "Your target stays on screen the whole time.",
    body: "Look at the top bar — that’s the article you must reach. Everything else is just the path there.",
    demo: <DemoHud />,
  },
  {
    id: "links",
    eyebrow: "3 · Click blue links only",
    title: "Blue text is a legal move. Everything else isn’t.",
    body: "Tap a blue Wikipedia link to hop. Plain text, images, and gray chrome don’t count — only those blue words.",
    demo: <DemoWikiLinks />,
  },
  {
    id: "hop",
    eyebrow: "4 · Keep hopping",
    title: "Each link opens a new article. Chain them.",
    body: "Build a path from start → bridge pages → target. Fewer hops and less time keep more of your score.",
    demo: <DemoPath />,
  },
  {
    id: "score",
    eyebrow: "5 · Fill the score bar",
    title: "Max score shrinks with every click and second.",
    body: "When you finish, the bar shows how much of the difficulty’s max you kept. Short, direct paths fill it more.",
    demo: <DemoScore />,
  },
  {
    id: "go",
    eyebrow: "Ready",
    title: "You’re set. Race a real page.",
    body: "Start the beginner race, or jump into challenges when you feel sharp.",
    demo: <DemoReady />,
  },
];

export function HowToPlayTour({
  autoStart = false,
  onClose,
}: {
  autoStart?: boolean;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(autoStart);
  const [index, setIndex] = useState(0);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const step = STEPS[index]!;
  const last = index === STEPS.length - 1;

  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    const focusable = node?.querySelector<HTMLElement>("button, a, [href]");
    focusable?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") setIndex((value) => Math.min(STEPS.length - 1, value + 1));
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    setOpen(false);
    setIndex(0);
    onClose?.();
  }

  function startBeginner() {
    close();
    router.push(
      playHref({
        start: BEGINNER.start,
        target: BEGINNER.target,
        mode: "classic",
        difficulty: BEGINNER.difficulty,
        guide: true,
      }),
    );
  }

  return (
    <>
      {!open ? (
        <Button onClick={() => setOpen(true)} className="min-h-12">
          {autoStart ? "Replay tour" : "Start the tour"}
        </Button>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-3 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="tour-dialog rise-in flex max-h-[min(92dvh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-card text-ink shadow-[var(--shadow)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
              <p className="text-sm font-semibold text-accent">{step.eyebrow}</p>
              <button
                type="button"
                onClick={close}
                className="pressable rounded-lg px-2 py-1 text-sm font-semibold text-muted hover:bg-soft hover:text-ink"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <div key={step.id} className="tour-step">
                <div className="overflow-hidden rounded-xl border border-[#c8ccd1] bg-[#f8f9fa]">
                  {step.demo}
                </div>
                <h2 id={titleId} className="mt-4 font-serif text-2xl font-semibold leading-tight sm:text-3xl">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted sm:text-base">{step.body}</p>
              </div>
            </div>

            <div className="border-t border-line px-4 py-3 sm:px-5">
              <div className="mb-3 flex items-center justify-center gap-1.5" aria-label="Tour progress">
                {STEPS.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Go to step ${i + 1}`}
                    aria-current={i === index ? "step" : undefined}
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === index ? "w-6 bg-accent" : "w-2 bg-line hover:bg-muted"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="min-h-11 flex-1"
                  disabled={index === 0}
                  onClick={() => setIndex((value) => Math.max(0, value - 1))}
                >
                  Previous
                </Button>
                {last ? (
                  <Button className="min-h-11 flex-1" onClick={startBeginner}>
                    Play beginner race
                  </Button>
                ) : (
                  <Button
                    className="min-h-11 flex-1"
                    onClick={() => setIndex((value) => Math.min(STEPS.length - 1, value + 1))}
                  >
                    Next
                  </Button>
                )}
              </div>
              {last ? (
                <div className="mt-2 flex justify-center">
                  <ButtonLink href="/challenges" variant="ghost" className="min-h-10 text-sm">
                    Browse challenges instead
                  </ButtonLink>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DemoPickRace() {
  return (
    <div className="relative bg-white p-3 pb-9 text-[#202122]">
      <p className="text-[0.65rem] font-semibold tracking-wide text-[#54595d]">Challenge</p>
      <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-[#c8ccd1] bg-[#f8f9fa] px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-serif text-base font-semibold">
            Cleopatra <span className="text-[#54595d]">→</span> Hollywood
          </p>
          <p className="text-xs text-[#54595d]">Easy · History</p>
        </div>
        <span className="tour-hotspot relative shrink-0 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-[var(--accent-ink)]">
          Play
          <TapHint label="Start here" />
        </span>
      </div>
    </div>
  );
}

function DemoHud() {
  return (
    <div className="bg-[color-mix(in_srgb,var(--card)_92%,transparent)] pb-8 text-ink">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
        <p className="truncate text-xs text-muted sm:text-sm">
          Racing to <strong className="text-ink">Hollywood, Los Angeles</strong>
        </p>
        <p className="shrink-0 text-xs font-bold tabular-nums">0 clicks · 0:12</p>
      </div>
      <div className="relative flex items-center gap-2 px-3 py-2.5">
        <span className="text-xs font-medium text-muted">Get to</span>
        <span className="tour-hotspot relative inline-flex max-w-[70%] items-center rounded-full border border-[color-mix(in_srgb,var(--accent)_40%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_12%,var(--card))] px-3 py-1">
          <strong className="truncate font-serif text-sm">Hollywood, Los Angeles</strong>
          <TapHint label="Finish line" />
        </span>
      </div>
    </div>
  );
}

function DemoWikiLinks() {
  return (
    <div className="relative bg-white px-3 py-3 pb-10 text-[#202122]">
      <p className="font-serif text-lg">Cleopatra</p>
      <p className="mt-1 text-[0.7rem] italic text-[#54595d]">From Wikipedia, the free encyclopedia</p>
      <p className="mt-3 text-sm leading-6">
        <span className="tour-hotspot relative inline">
          <span className="tour-wiki-link">Cleopatra VII</span>
          <TapHint label="Tap a blue link" />
        </span>{" "}
        was queen of{" "}
        <span className="tour-wiki-link tour-wiki-link--idle">Ptolemaic Egypt</span>, the last
        active ruler of the{" "}
        <span className="tour-wiki-link tour-wiki-link--idle">Ptolemaic Kingdom</span>.
      </p>
      <p className="mt-3 text-xs font-semibold text-[#54595d]">
        Only the blue words are clicks. Plain text is just reading.
      </p>
    </div>
  );
}

function DemoPath() {
  const hops = ["Cleopatra", "Egypt", "Cinema of the United States", "Hollywood"];
  return (
    <div className="bg-white px-3 py-3 pb-9 text-[#202122]">
      <p className="text-[0.65rem] font-semibold text-[#54595d]">Your path</p>
      <ol className="mt-2 space-y-1.5">
        {hops.map((title, index) => {
          const last = index === hops.length - 1;
          return (
            <li
              key={title}
              className={`tour-hop flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm ${
                last
                  ? "tour-hotspot relative border border-[color-mix(in_srgb,var(--accent)_45%,#c8ccd1)] bg-[color-mix(in_srgb,var(--accent)_10%,#fff)] font-semibold"
                  : "border border-transparent bg-[#f8f9fa] text-[#54595d]"
              }`}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <span className="tabular-nums text-xs opacity-60">{index + 1}</span>
              <span className="truncate">{title}</span>
              {last ? <TapHint label="You win here" /> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function DemoScore() {
  return (
    <div className="bg-[var(--card)] px-3 py-3 text-ink">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold">Run score</p>
        <p className="text-xs tabular-nums text-muted">
          <strong className="text-ink">980</strong> / 1,200
        </p>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-soft">
        <div className="tour-score-fill h-full rounded-full bg-accent" style={{ width: "82%" }} />
      </div>
      <p className="mt-2 text-xs text-muted">Fewer clicks + faster finish = fuller bar.</p>
    </div>
  );
}

function DemoReady() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 bg-white px-3 py-6 text-center text-[#202122]">
      <div className="race-line w-full max-w-xs">
        <span className="truncate font-serif text-sm font-semibold">Cleopatra</span>
        <span className="race-track w-12" aria-hidden="true" />
        <span className="truncate text-right font-serif text-sm font-semibold">Hollywood</span>
      </div>
      <p className="text-xs text-[#54595d]">Beginner race · Easy</p>
    </div>
  );
}

function TapHint({ label = "Tap" }: { label?: string }) {
  return (
    <span className="tour-tap" aria-hidden="true">
      <span className="tour-tap__finger" />
      <span className="tour-tap__label">{label}</span>
    </span>
  );
}
