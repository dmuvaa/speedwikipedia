import type { PathStep } from "@/lib/types";
import { formatClock } from "@/lib/format";

export function PathList({ path, withTime = false }: { path: PathStep[]; withTime?: boolean }) {
  if (path.length === 0) {
    return <p className="text-sm text-muted">Your hops will line up here.</p>;
  }

  return (
    <ol className="space-y-0">
      {path.map((step, index) => {
        const last = index === path.length - 1;
        return (
          <li key={`${step.title}-${index}`} className="relative pb-4 pl-6 last:pb-0">
            {index < path.length - 1 ? (
              <span
                className="absolute top-3 left-[5px] h-[calc(100%-4px)] w-px bg-gradient-to-b from-accent to-line"
                aria-hidden="true"
              />
            ) : null}
            <span
              className={`absolute top-1.5 left-0 h-2.5 w-2.5 rounded-full ${
                last ? "bg-accent shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_22%,transparent)]" : "bg-line"
              }`}
              aria-hidden="true"
            />
            <p className={`leading-snug ${last ? "font-semibold text-ink" : "text-muted"}`}>{step.title}</p>
            {withTime ? <p className="mt-0.5 text-xs text-muted tabular-nums">{formatClock(step.atMs)}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
