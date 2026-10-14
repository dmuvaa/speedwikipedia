"use client";

import { useRouter } from "next/navigation";
import { pickQuickChallenge } from "@/lib/challenges";
import { playHref } from "@/lib/titles";

export function QuickPlayButton({
  children,
  excludeSlug,
  className = "",
}: {
  children: string;
  excludeSlug?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const challenge = pickQuickChallenge(excludeSlug);
        router.push(
          playHref({
            start: challenge.start,
            target: challenge.target,
            mode: "classic",
            difficulty: challenge.difficulty,
          }),
        );
      }}
    >
      {children}
    </button>
  );
}
