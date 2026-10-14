export function SiteFooter() {
  return (
    <footer className="site-chrome mt-auto border-t border-line/80">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Article text is from Wikipedia and is available under CC BY-SA 4.0.</p>
        <p className="flex gap-4">
          <a className="underline decoration-line underline-offset-4 hover:text-ink" href="https://www.wikipedia.org/">
            Wikipedia
          </a>
          <a
            className="underline decoration-line underline-offset-4 hover:text-ink"
            href="https://creativecommons.org/licenses/by-sa/4.0/"
          >
            License
          </a>
        </p>
      </div>
    </footer>
  );
}
