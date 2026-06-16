"use client";

import { cn } from "@/lib/utils";

export interface DayStat {
  label: string;
  value: string;
  tone?: "win" | "loss" | "neutral";
}

/**
 * Inline row of day stats — no card chrome, so it flows within the expanded day
 * rather than reading as a nested box. Wraps to 2/3 columns on narrow widths and
 * spreads evenly across the full width on large screens.
 */
export function JournalDayStatStrip({ stats }: { stats: DayStat[] }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-surface-subtle px-4 py-3.5 sm:grid-cols-3 lg:grid-cols-[repeat(var(--stat-cols),minmax(0,1fr))]"
      style={{ ["--stat-cols" as string]: stats.length }}
    >
      {stats.map((stat) => (
        <div key={stat.label}>
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
