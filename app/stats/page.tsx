import type { Metadata } from "next";
import { StatsPanel } from "@/components/stats-panel";

export const metadata: Metadata = {
  title: "Stats",
  description: "Wins, streaks, and personal bests saved on this device.",
};

export default function StatsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="display-tight font-serif text-3xl font-semibold sm:text-5xl">On this device</h1>
      <p className="mt-3 max-w-xl text-sm text-muted sm:mt-4 sm:text-base">
        No account yet. Finishes are saved in this browser, and a new browser starts from zero.
      </p>
      <div className="mt-6 sm:mt-8">
        <StatsPanel />
      </div>
    </main>
  );
}
