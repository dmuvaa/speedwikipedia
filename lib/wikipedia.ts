import { cacheLife } from "next/cache";
import { extractLeadDescription, processArticleHtml } from "@/lib/process-article";
import { articleKey, isPlayableTitle, wikiPageUrl } from "@/lib/titles";
import type { Article, ArticleMeta, SearchHit } from "@/lib/types";

const WIKI_HEADERS = {
  "User-Agent": "SpeedWikipedia/0.1 (educational Wikipedia navigation game; +https://speedwikipedia.local)",
  "Api-User-Agent": "SpeedWikipedia/0.1 (educational Wikipedia navigation game)",
  Accept: "application/json",
};

export class WikiError extends Error {
  readonly code: "missing" | "rate" | "upstream" | "invalid";
  readonly status: number;

  constructor(code: WikiError["code"]) {
    super(code);
    this.name = "WikiError";
    this.code = code;
    this.status = code === "missing" || code === "invalid" ? 404 : code === "rate" ? 429 : 502;
  }
}

type SummaryResponse = {
  title?: string;
  description?: string;
  extract?: string;
  thumbnail?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
};

type ParseResponse = {
  parse?: { title?: string; text?: string };
  error?: { code?: string };
};

function assertTitle(title: string) {
  const cleaned = articleKey(title);
  if (!isPlayableTitle(cleaned)) throw new WikiError("invalid");
  return cleaned;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function wikiFetch(url: string, attempt = 0): Promise<Response> {
  try {
    const response = await fetch(url, {
      headers: WIKI_HEADERS,
      // Cached by "use cache" above — each title should hit Wikipedia once.
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 404) throw new WikiError("missing");
    // One short retry only — stacking retries across many players worsens 429s.
    if ((response.status === 429 || response.status === 503) && attempt < 1) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryAfter)
        ? Math.min(Math.max(retryAfter * 1_000, 400), 2_500)
        : 800;
      await sleep(waitMs);
      return wikiFetch(url, attempt + 1);
    }
    if (response.status === 429) throw new WikiError("rate");
    if (!response.ok) throw new WikiError("upstream");
    return response;
  } catch (error) {
    if (error instanceof WikiError) throw error;
    if (attempt < 1) {
      await sleep(400);
      return wikiFetch(url, attempt + 1);
    }
    throw new WikiError("upstream");
  }
}

const inflightArticles = new Map<string, Promise<Article>>();

/** Bump when the HTML pipeline changes so "use cache" entries rebuild. */
const ARTICLE_PIPELINE = 4;

export function getArticle(title: string) {
  const key = assertTitle(title);
  const pending = inflightArticles.get(key);
  if (pending) return pending;
  const request = loadArticle(key, ARTICLE_PIPELINE).finally(() => {
    if (inflightArticles.get(key) === request) inflightArticles.delete(key);
  });
  inflightArticles.set(key, request);
  return request;
}

async function loadArticle(title: string, pipeline: number): Promise<Article> {
  "use cache";
  cacheLife("days");
  // `pipeline` is part of the cache key only.
  void pipeline;

  const parseUrl = new URL("https://en.wikipedia.org/w/api.php");
  parseUrl.searchParams.set("action", "parse");
  parseUrl.searchParams.set("page", title);
  parseUrl.searchParams.set("prop", "text");
  parseUrl.searchParams.set("format", "json");
  parseUrl.searchParams.set("formatversion", "2");
  parseUrl.searchParams.set("redirects", "1");
  parseUrl.searchParams.set("disableeditsection", "1");
  parseUrl.searchParams.set("disabletoc", "1");

  const parseResponse = await wikiFetch(parseUrl.toString());
  const parsed = (await parseResponse.json()) as ParseResponse;
  if (parsed.error?.code === "missingtitle" || !parsed.parse?.text || !parsed.parse.title) {
    throw new WikiError("missing");
  }

  const html = processArticleHtml(parsed.parse.text);
  if (!html.trim()) throw new WikiError("missing");

  const canonical = parsed.parse.title;
  return {
    title: canonical,
    description: extractLeadDescription(html),
    extract: null,
    thumbnail: null,
    pageUrl: wikiPageUrl(canonical),
    html,
  };
}

export function getArticleMeta(title: string) {
  return loadArticleMeta(assertTitle(title));
}

async function loadArticleMeta(title: string): Promise<ArticleMeta> {
  "use cache";
  cacheLife("days");

  const response = await wikiFetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
  );
  const summary = (await response.json()) as SummaryResponse;
  if (!summary.title) throw new WikiError("missing");
  return {
    title: summary.title,
    description: summary.description ?? null,
    thumbnail: summary.thumbnail?.source ?? null,
    pageUrl: summary.content_urls?.desktop?.page ?? wikiPageUrl(summary.title),
  };
}

export function searchArticles(query: string) {
  return loadSearch(query);
}

async function loadSearch(query: string): Promise<SearchHit[]> {
  "use cache";
  cacheLife("minutes");

  const url = new URL("https://en.wikipedia.org/w/rest.php/v1/search/page");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "8");
  const response = await wikiFetch(url.toString());
  const payload = (await response.json()) as {
    pages?: { title?: string; description?: string | null }[];
  };
  return (payload.pages ?? [])
    .filter((page) => page.title && isPlayableTitle(page.title))
    .map((page) => ({
      title: page.title as string,
      description: page.description ?? null,
    }));
}
