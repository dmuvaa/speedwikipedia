import type { Metadata } from "next";
import { Suspense } from "react";
import { DailyCardFallback, DailySpotlight } from "@/components/daily-spotlight";
import { StreakNote } from "@/components/stats-panel";

export const metadata: Metadata = {
  title: "Daily challenge",
  description: "The same Wikipedia connection for every player, chosen from the date.",
};

export default function DailyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="display-tight font-serif text-3xl font-semibold sm:text-5xl">
        Same pair. Every player.
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted sm:mt-4 sm:text-base">
        The challenge changes at midnight UTC. Scores and streaks stay on this device.
      </p>
      <div className="mt-6 sm:mt-8">
        <Suspense fallback={<DailyCardFallback />}>
          <DailySpotlight detailed />
        </Suspense>
      </div>
      <div className="mt-5 sm:mt-6">
        <StreakNote />
      </div>
    </main>
  );
}
