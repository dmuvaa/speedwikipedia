import type { Metadata, Viewport } from "next";
import { Source_Serif_4 } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source",
  subsets: ["latin"],
  display: "swap",
});

const themeScript = `(function(){try{var t=localStorage.getItem("speedwikipedia-theme");var root=document.documentElement;if(t==="dark"){root.classList.add("dark");root.classList.remove("light");}else if(t==="light"){root.classList.add("light");root.classList.remove("dark");}}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://speedwikipedia.vercel.app",
  ),
  title: {
    default: "SpeedWikipedia",
    template: "%s · SpeedWikipedia",
  },
  description:
    "Navigate from one Wikipedia article to another using only the links on the page. Fewest clicks. Shortest time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} h-full antialiased`}
      style={{
        ["--font-ui" as string]:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <Suspense fallback={<div className="site-chrome h-14" />}>
          <SiteHeader />
        </Suspense>
        <div id="content" className="flex flex-1 flex-col">
          {children}
        </div>
        <SiteFooter />
        <noscript>
          <p className="border-t border-line px-4 py-3 text-sm">
            SpeedWikipedia needs JavaScript to load articles and keep score.
          </p>
        </noscript>
      </body>
    </html>
  );
}
