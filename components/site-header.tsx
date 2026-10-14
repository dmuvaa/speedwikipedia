"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/challenges", label: "Challenges" },
  { href: "/daily", label: "Daily" },
  { href: "/create", label: "Create" },
  { href: "/stats", label: "Stats" },
];

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Main"
      className="-mx-1 flex max-w-[min(100%,22rem)] items-center gap-1 overflow-x-auto px-1 pb-0.5 sm:max-w-none sm:overflow-visible"
    >
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`pressable inline-flex h-9 shrink-0 items-center rounded-lg border px-2.5 text-sm font-semibold sm:h-10 sm:rounded-xl sm:px-3 ${
              active
                ? "border-ink bg-ink text-paper"
                : "border-line bg-card text-ink shadow-[0_1px_0_rgb(0_0_0/4%)] hover:bg-soft"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveNav() {
  const pathname = usePathname();
  return <NavLinks pathname={pathname} />;
}

export function SiteHeader() {
  return (
    <header className="site-chrome sticky top-0 z-30 shrink-0 hud-glass">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-2.5">
        <Link
          href="/"
          className="pressable inline-flex h-9 shrink-0 items-center rounded-lg border border-line bg-card px-2.5 text-sm font-bold tracking-tight shadow-[0_1px_0_rgb(0_0_0/4%)] sm:h-10 sm:rounded-xl sm:px-3 sm:text-base"
        >
          SpeedWikipedia
        </Link>
        <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
          <Suspense fallback={<NavLinks pathname="" />}>
            <ActiveNav />
          </Suspense>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
