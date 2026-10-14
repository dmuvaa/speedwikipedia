"use client";

import { Button } from "@/components/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-20">
      <h1 className="font-serif text-5xl leading-none">Something went wrong.</h1>
      <p className="mt-4 text-muted">The page failed to load. You can try it again.</p>
      <div className="mt-6">
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
