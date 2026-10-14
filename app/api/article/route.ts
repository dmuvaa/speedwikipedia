import { NextRequest } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getArticle, getArticleMeta, WikiError } from "@/lib/wikipedia";

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title")?.trim() ?? "";
  const meta = request.nextUrl.searchParams.get("meta") === "1";
  if (!title) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  // Burst-only guard for scrapers. Normal play is ~1 click every few seconds.
  // Never use a per-minute budget here — that blocks real games under load.
  const ip = clientIp(request.headers);
  if (!rateLimit(`article-burst:${ip}`, 12, 1_000)) {
    return Response.json({ error: "rate" }, { status: 429 });
  }

  try {
    const article = meta ? await getArticleMeta(title) : await getArticle(title);
    return Response.json(article, {
      headers: {
        // Articles change slowly; CDN/browser cache is what makes this scale.
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    const code =
      error instanceof WikiError
        ? error.code
        : error instanceof Error &&
            (error.message === "missing" ||
              error.message === "invalid" ||
              error.message === "rate" ||
              error.message === "upstream")
          ? error.message
          : "upstream";
    const status = code === "missing" || code === "invalid" ? 404 : code === "rate" ? 429 : 502;
    return Response.json({ error: code }, { status });
  }
}
