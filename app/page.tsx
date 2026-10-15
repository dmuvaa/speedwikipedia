import { Suspense } from "react";
import { ButtonLink } from "@/components/button";
import { ChallengeRow } from "@/components/challenge-row";
import { DailyCardFallback, DailySpotlight } from "@/components/daily-spotlight";
import { Onboarding } from "@/components/onboarding";
import { QuickPlayButton } from "@/components/quick-play-button";
import { HOME_CHALLENGES } from "@/lib/challenges";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 pt-8 pb-12 sm:gap-10 sm:pt-14 sm:pb-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(17rem,0.95fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold tracking-tight text-accent">SpeedWikipedia</p>
            <h1 className="display-tight mt-2 max-w-xl font-serif text-3xl font-semibold sm:text-5xl lg:text-6xl">
              Race through real Wikipedia pages.
            </h1>
            <p className="mt-3 max-w-md text-base leading-7 text-muted sm:text-lg">
              Same blue links. Same articles. Your job is to reach the target in as few hops as you can.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <QuickPlayButton className="pressable inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-accent bg-accent px-8 text-base font-semibold text-accent-ink shadow-[0_1px_0_rgb(0_0_0/10%)] hover:opacity-90 sm:w-auto">
                Quick play
              </QuickPlayButton>
              <ButtonLink href="/how-to-play" variant="secondary" className="min-h-12 w-full px-6 sm:w-auto">
                How to play
              </ButtonLink>
              <ButtonLink href="/create" variant="ghost" className="min-h-12 w-full px-6 sm:w-auto">
                Make your own
              </ButtonLink>
            </div>

            <ul className="mt-5 grid grid-cols-1 gap-2 text-sm text-muted sm:mt-6 sm:grid-cols-3 sm:gap-3">
              <li className="rounded-xl border border-line bg-card/80 px-3 py-2.5">Start on a page</li>
              <li className="rounded-xl border border-line bg-card/80 px-3 py-2.5">Click only wiki links</li>
              <li className="rounded-xl border border-line bg-card/80 px-3 py-2.5">Hit the target</li>
            </ul>
          </div>

          <div className="wiki-preview" aria-hidden="true">
            <div className="wiki-preview__chrome">
              <span className="wiki-preview__dot" />
              <span className="wiki-preview__dot" />
              <span className="wiki-preview__dot" />
              <span className="wiki-preview__url">en.wikipedia.org</span>
            </div>
            <div className="wiki-preview__body">
              <p className="wiki-preview__tag">From Wikipedia, the free encyclopedia</p>
              <p className="wiki-preview__title">Cleopatra</p>
              <p className="wiki-preview__text">
                <span className="wiki-preview__link">Cleopatra VII</span> was queen of{" "}
                <span className="wiki-preview__link">Ptolemaic Egypt</span>, the last active
                ruler of the <span className="wiki-preview__link">Ptolemaic Kingdom</span>.
              </p>
              <div className="race-line mt-5">
                <span className="truncate font-serif text-base font-semibold text-[#202122]">Cleopatra</span>
                <span className="race-track w-14" />
                <span className="truncate text-right font-serif text-base font-semibold text-[#202122]">
                  Hollywood
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line/80">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:gap-8 sm:py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:items-stretch">
          <div className="flex flex-col justify-center">
            <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-4xl">Today&apos;s race</h2>
            <p className="mt-2 max-w-md text-sm text-muted sm:mt-3 sm:text-base">
              One shared pair every UTC day. Finish in Classic to keep a streak on this device.
            </p>
          </div>
          <Suspense fallback={<DailyCardFallback />}>
            <DailySpotlight />
          </Suspense>
        </div>
      </section>

      <section className="border-t border-line/80">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-4xl">Challenges</h2>
              <p className="mt-1 text-sm text-muted sm:mt-2">Curated hops — from near neighbors to long hauls.</p>
            </div>
            <ButtonLink href="/challenges" variant="secondary" className="shrink-0">
              Browse all
            </ButtonLink>
          </div>
          <div className="mt-5 divide-y divide-line/80 overflow-hidden rounded-2xl surface sm:mt-6">
            {HOME_CHALLENGES.map((challenge) => (
              <ChallengeRow key={challenge.slug} challenge={challenge} />
            ))}
          </div>
        </div>
      </section>
      <Onboarding />
    </main>
  );
}
