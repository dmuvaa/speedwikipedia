export function articleErrorCopy(code: string | null) {
  if (code === "rate") {
    return "That article is busy right now. Try the link again in a moment.";
  }
  if (code === "missing" || code === "invalid") return "This article is unavailable.";
  if (code === "same") return "The start and target are the same article. Choose another challenge.";
  return "We couldn't load this article.";
}
