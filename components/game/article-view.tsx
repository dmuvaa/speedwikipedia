"use client";

import { useEffect, useRef } from "react";
import type { Article } from "@/lib/types";

export function ArticleView({
  article,
  pending,
  scrollHash,
  onNavigate,
}: {
  article: Article;
  pending: boolean;
  scrollHash: string | null;
  onNavigate: (title: string, hash: string | null) => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const seen = useRef(false);

  useEffect(() => {
    if (!seen.current) {
      seen.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [article.title]);

  useEffect(() => {
    if (!scrollHash) return;
    const decoded = scrollHash.replace(/ /g, "_");
    const target = document.getElementById(scrollHash) ?? document.getElementById(decoded);
    target?.scrollIntoView({ block: "start" });
  }, [scrollHash, article.title]);

  return (
    <article
      aria-busy={pending}
      className={`wiki-page ${pending ? "wiki-page--pending" : ""}`}
    >
      <header className="wiki-page__header">
        <div className="wiki-page__title-row">
          <h1 ref={headingRef} tabIndex={-1} className="wiki-page__title">
            {article.title}
          </h1>
        </div>
        <div className="wiki-page__tabs" aria-hidden="true">
          <div className="wiki-page__tabs-left">
            <span className="wiki-page__tab wiki-page__tab--active">Article</span>
            <span className="wiki-page__tab">Talk</span>
          </div>
          <div className="wiki-page__tabs-right">
            <span className="wiki-page__tab wiki-page__tab--active">Read</span>
            <span className="wiki-page__tab">View source</span>
            <span className="wiki-page__tab">View history</span>
          </div>
        </div>
        <p className="wiki-page__tagline">From Wikipedia, the free encyclopedia</p>
        {article.description ? <p className="wiki-page__lead">{article.description}</p> : null}
        {pending ? <p className="wiki-page__status">Loading the next article…</p> : null}
      </header>

      <div
        className="article"
        onPointerDown={(event) => {
          const link = (event.target as HTMLElement).closest("a.wiki-link");
          if (link instanceof HTMLAnchorElement) link.dataset.pressed = "1";
        }}
        onPointerUp={(event) => {
          const link = (event.target as HTMLElement).closest("a.wiki-link");
          if (link instanceof HTMLAnchorElement) delete link.dataset.pressed;
        }}
        onClick={(event) => {
          const link = (event.target as HTMLElement).closest("a.wiki-link");
          if (!(link instanceof HTMLAnchorElement)) return;
          event.preventDefault();
          const title = link.dataset.title;
          if (!title) return;
          onNavigate(title, link.dataset.hash ?? null);
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: article.html }} />
      </div>

      <p className="wiki-page__footer">
        Text from Wikipedia, available under CC BY-SA 4.0. Links stay inside the game.
      </p>
    </article>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="wiki-page wiki-page--skeleton" aria-hidden="true">
      <div className="h-10 w-2/3 rounded-sm bg-[#eaecf0]" />
      <div className="mt-4 h-px w-full bg-[#c8ccd1]" />
      <div className="mt-3 h-3 w-48 rounded-sm bg-[#eaecf0]" />
      <div className="mt-6 space-y-3">
        <div className="h-3 w-full rounded-sm bg-[#eaecf0]" />
        <div className="h-3 w-11/12 rounded-sm bg-[#eaecf0]" />
        <div className="h-3 w-4/5 rounded-sm bg-[#eaecf0]" />
        <div className="mt-6 h-40 w-full max-w-xs rounded-sm bg-[#eaecf0] sm:float-right sm:ml-4" />
        <div className="h-3 w-full rounded-sm bg-[#eaecf0]" />
        <div className="h-3 w-10/12 rounded-sm bg-[#eaecf0]" />
      </div>
    </div>
  );
}
