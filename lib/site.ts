/** Canonical production origin. Override with NEXT_PUBLIC_SITE_URL for a custom domain. */
const DEFAULT_SITE_URL = "https://speedwikipedia.vercel.app";

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function isLocalOrigin(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

/** Absolute site origin for share links and copy-URL actions. */
export function getSiteUrl() {
  const configured = stripTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL,
  );

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // On a real deploy (or custom domain), use the host the player is on.
    // On localhost, prefer the public site so shared links aren't useless.
    if (!isLocalOrigin(origin)) return origin;
  }

  return configured;
}

export function absoluteUrl(path: string) {
  const base = getSiteUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
