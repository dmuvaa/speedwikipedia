import { articleKey } from "@/lib/titles";
import type { Article } from "@/lib/types";

/** Bump with /api/article `v=` so in-tab cache drops stale HTML after pipeline changes. */
const CACHE_EPOCH = 4;

const MAX = 64;
const store = new Map<string, Article>();
const inflight = new Map<string, Promise<Article>>();

function keyFor(title: string) {
  return `${CACHE_EPOCH}:${articleKey(title).toLocaleLowerCase()}`;
}

export function peekArticle(title: string) {
  return store.get(keyFor(title)) ?? null;
}

export function rememberArticle(article: Article) {
  const key = keyFor(article.title);
  if (store.has(key)) store.delete(key);
  store.set(key, article);
  while (store.size > MAX) {
    const oldest = store.keys().next().value;
    if (oldest == null) break;
    store.delete(oldest);
  }
}

export async function loadCachedArticle(
  title: string,
  loader: () => Promise<Article>,
): Promise<Article> {
  const key = keyFor(title);
  const hit = store.get(key);
  if (hit) return hit;

  const pending = inflight.get(key);
  if (pending) return pending;

  const request = loader()
    .then((article) => {
      rememberArticle(article);
      return article;
    })
    .catch((error) => {
      inflight.delete(key);
      throw error;
    })
    .finally(() => {
      if (inflight.get(key) === request) inflight.delete(key);
    });
  inflight.set(key, request);
  return request;
}

/** Warm the target in the background. No hover prefetch — that breaks play at scale. */
export function warmArticle(title: string, loader: () => Promise<Article>) {
  if (typeof window === "undefined") return;
  if (!title || store.has(keyFor(title)) || inflight.has(keyFor(title))) return;
  const run = () => {
    void loadCachedArticle(title, loader).catch(() => {
      // Background warm only.
    });
  };
  const idle = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }
  ).requestIdleCallback;
  if (idle) idle(run, { timeout: 2_000 });
  else window.setTimeout(run, 250);
}

export async function fetchArticleWithRetry(
  title: string,
  loader: () => Promise<Article>,
  retries = 1,
): Promise<Article> {
  let attempt = 0;
  for (;;) {
    try {
      return await loadCachedArticle(title, loader);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const retriable = message === "rate" || message === "upstream";
      if (!retriable || attempt >= retries) throw error;
      attempt += 1;
      inflight.delete(keyFor(title));
      // One patient retry — don't stampede Wikipedia when it's already limiting.
      await new Promise((resolve) => window.setTimeout(resolve, 1_200 * attempt));
    }
  }
}
