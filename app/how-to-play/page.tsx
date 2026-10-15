import type { Metadata } from "next";
import { HowToPlayTour } from "@/components/how-to-play-tour";

export const metadata: Metadata = {
  title: "How to play",
  description: "A quick tour of SpeedWikipedia — what to click, where the target is, and how scoring works.",
};

export default function HowToPlayPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10 sm:py-16">
      <p className="text-sm font-semibold text-accent">How to play</p>
      <h1 className="display-tight mt-2 font-serif text-3xl font-semibold sm:text-5xl">
        A 30-second tour of the race.
      </h1>
      <p className="mt-3 text-base leading-7 text-muted">
        Step through dialogs that show exactly what to tap — blue links, the finish line, and the
        score bar.
      </p>
      <div className="mt-8">
        <HowToPlayTour autoStart />
      </div>
    </main>
  );
}
