"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ButtonLink } from "@/components/button";
import { MODE_META } from "@/lib/modes";
import { absoluteUrl } from "@/lib/site";
import { GAME_MODES, type GameMode, type SearchHit } from "@/lib/types";
import { playHref, titlesMatch } from "@/lib/titles";

export function CreateForm() {
  const [start, setStart] = useState<SearchHit | null>(null);
  const [target, setTarget] = useState<SearchHit | null>(null);
  const [mode, setMode] = useState<GameMode>("classic");

  const same = start && target ? titlesMatch(start.title, target.title) : false;
  const ready = Boolean(start && target && !same);
  const href = ready
    ? playHref({
        start: start!.title,
        target: target!.title,
        mode,
        difficulty: "medium",
      })
    : "";

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <ArticleField label="Start article" selected={start} onSelect={setStart} />
      <ArticleField label="Target article" selected={target} onSelect={setTarget} />
      {same ? <p className="text-sm text-accent">Choose two different articles.</p> : null}

      <fieldset>
        <legend className="text-sm font-medium text-muted">Mode</legend>
        <div className="mt-3 grid gap-2">
          {GAME_MODES.map((item) => (
            <label
              key={item}
              className="pressable flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-line bg-card px-3 py-3 hover:bg-soft"
            >
              <input
                type="radio"
                name="mode"
                value={item}
                checked={mode === item}
                onChange={() => setMode(item)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium">{MODE_META[item].label}</span>
                <span className="block text-sm text-muted">{MODE_META[item].detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        {ready ? (
          <ButtonLink href={href}>Start challenge</ButtonLink>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 items-center rounded-xl border border-accent bg-accent px-5 text-sm font-semibold text-accent-ink opacity-50"
          >
            Start challenge
          </button>
        )}
        {ready ? <CopyLink href={href} /> : null}
      </div>
    </form>
  );
}

function CopyLink({ href }: { href: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="pressable inline-flex min-h-11 items-center rounded-full px-3 text-sm text-muted hover:bg-soft hover:text-ink"
      onClick={async () => {
        const url = absoluteUrl(href);
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}

function ArticleField({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: SearchHit | null;
  onSelect: (hit: SearchHit | null) => void;
}) {
  const listId = useId();
  const [query, setQuery] = useState(selected?.title ?? "");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState("");
  const request = useRef(0);

  useEffect(() => {
    if (selected && query === selected.title) return;
    if (query.trim().length < 2) return;
    const current = ++request.current;
    const handle = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const payload = (await response.json()) as { results?: SearchHit[]; error?: string };
        if (current !== request.current) return;
        if (!response.ok) {
          setResults([]);
          setStatus(
            payload.error === "rate"
              ? "Search is busy. Try again in a moment."
              : "Search is unavailable right now.",
          );
          return;
        }
        const next = payload.results ?? [];
        setResults(next);
        setActive(0);
        setOpen(true);
        setStatus(next.length === 0 ? "No articles found." : `${next.length} suggestions`);
      } catch {
        if (current !== request.current) return;
        setStatus("Search is unavailable right now.");
      }
    }, 220);
    return () => window.clearTimeout(handle);
  }, [query, selected]);

  function choose(hit: SearchHit) {
    onSelect(hit);
    setQuery(hit.title);
    setOpen(false);
    setResults([]);
  }

  return (
    <div className="relative">
      <label className="text-sm font-medium text-muted" htmlFor={listId}>
        {label}
      </label>
      <input
        id={listId}
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={`${listId}-list`}
        aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `${listId}-opt-${active}` : undefined}
        value={query}
        placeholder="Search Wikipedia"
        className="mt-2 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none focus-visible:border-accent"
        onChange={(event) => {
          setQuery(event.target.value);
          onSelect(null);
          setOpen(true);
          if (event.target.value.trim().length < 2) {
            setResults([]);
            setStatus("");
          }
        }}
        onKeyDown={(event) => {
          if (!open || results.length === 0) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => (index + 1) % results.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => (index - 1 + results.length) % results.length);
          } else if (event.key === "Enter" && results[active]) {
            event.preventDefault();
            choose(results[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
      />
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
      {open && results.length > 0 ? (
        <ul
          id={`${listId}-list`}
          role="listbox"
          className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-2xl border border-line bg-card shadow-[var(--shadow)]"
        >
          {results.map((hit, index) => (
            <li key={hit.title} role="option" id={`${listId}-opt-${index}`} aria-selected={index === active}>
              <button
                type="button"
                className={`block w-full px-3 py-3 text-left ${index === active ? "bg-soft" : "hover:bg-soft"}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(hit)}
              >
                <span className="block font-medium">{hit.title}</span>
                {hit.description ? <span className="block text-sm text-muted">{hit.description}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
