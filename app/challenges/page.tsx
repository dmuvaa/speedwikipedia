import type { Metadata } from "next";
import { ChallengesBrowser } from "@/components/challenges-browser";

export const metadata: Metadata = {
  title: "Challenges",
  description: "Curated Wikipedia races, from a one-click hop to distant connections.",
};

export default function ChallengesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <h1 className="display-tight max-w-2xl font-serif text-3xl font-semibold sm:text-5xl">
        Pick a connection.
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted sm:mt-4 sm:text-base">
        Grouped by Easy, Medium, Hard, and Extra hard — from one-hop neighbors to barely connected pages.
      </p>
      <div className="mt-6 sm:mt-8">
        <ChallengesBrowser />
      </div>
    </main>
  );
}
