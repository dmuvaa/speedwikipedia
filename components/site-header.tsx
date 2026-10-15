"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useId, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/how-to-play", label: "How to play" },
  { href: "/challenges", label: "Challenges" },
  { href: "/daily", label: "Daily" },
  { href: "/create", label: "Create" },
  { href: "/stats", label: "Stats" },
];

function linkClass(active: boolean) {
  return `pressable inline-flex min-h-11 items-center rounded-xl border px-3.5 text-sm font-semibold ${
    active
      ? "border-ink bg-ink text-paper"
      : "border-line bg-card text-ink shadow-[0_1px_0_rgb(0_0_0/4%)] hover:bg-soft"
  }`;
}

function NavLinks({
  pathname,
  onNavigate,
  className = "",
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav aria-label="Main" className={className}>
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={linkClass(active)}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveDesktopNav() {
  const pathname = usePathname();
  return (
    <NavLinks
      pathname={pathname}
      className="hidden items-center gap-1.5 md:flex"
    />
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="site-chrome sticky top-0 z-30 shrink-0 hud-glass">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-2.5">
        <Link
          href="/"
          className="pressable inline-flex h-10 shrink-0 items-center rounded-xl border border-line bg-card px-3 text-sm font-bold tracking-tight text-ink shadow-[0_1px_0_rgb(0_0_0/4%)] sm:text-base"
        >
          SpeedWikipedia
        </Link>

        <div className="flex min-w-0 items-center gap-1.5">
          <Suspense fallback={<nav className="hidden md:flex" aria-hidden="true" />}>
            <ActiveDesktopNav />
          </Suspense>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <button
            type="button"
            className="pressable inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card text-ink shadow-[0_1px_0_rgb(0_0_0/4%)] hover:bg-soft md:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close" : "Menu"}</span>
            <HamburgerIcon open={open} />
          </button>
        </div>
      </div>

      {open ? (
        <div
          id={panelId}
          className="border-t border-line bg-card md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-3 py-3 sm:px-4">
            <NavLinks
              pathname={pathname}
              onNavigate={() => setOpen(false)}
              className="flex flex-col gap-2"
            />
            <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
              <p className="text-sm font-medium text-muted">Appearance</p>
              <ThemeToggle />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="text-ink">
      {open ? (
        <path
          d="M4 4l10 10M14 4L4 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M3 5h12M3 9h12M3 13h12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
