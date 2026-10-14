import { NextRequest } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { searchArticles, WikiError } from "@/lib/wikipedia";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 80) {
    return Response.json({ results: [] });
  }
  if (!rateLimit(`search:${clientIp(request.headers)}`, 60)) {
    return Response.json({ error: "rate" }, { status: 429 });
  }

  try {
    const results = await searchArticles(query);
    return Response.json({ results });
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
