"use client";

import { cn } from "@/lib/utils";

export interface DayStat {
  label: string;
  value: string;
  tone?: "win" | "loss" | "neutral";
}

/**
 * Horizontal strip of day stats, divided into cells. Wraps to 2/3 columns on
 * narrow widths and lays out as a single row on large screens, spreading the
 * cells evenly across the full width regardless of how many there are.
 */
export function JournalDayStatStrip({ stats }: { stats: DayStat[] }) {
  return (
    <div
      className="grid grid-cols-2 overflow-hidden rounded-xl bg-card-bg ring-1 ring-hairline sm:grid-cols-3 lg:grid-cols-[repeat(var(--stat-cols),minmax(0,1fr))]"
      style={{ ["--stat-cols" as string]: stats.length }}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            "px-4 py-3.5",
            // Right divider except last column in each breakpoint — approximate
            // with a left border on all but the first, kept subtle.
            i > 0 && "border-l border-hairline",
          )}
        >
          <p className="text-xs text-text-secondary">{stat.label}</p>
          <p
            className={cn(
              "mt-1 text-base font-bold tabular-nums",
              stat.tone === "win" && "text-kpi-metric-positive",
              stat.tone === "loss" && "text-danger",
              (!stat.tone || stat.tone === "neutral") && "text-text-primary",
            )}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
