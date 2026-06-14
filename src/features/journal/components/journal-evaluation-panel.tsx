"use client";

import { cn } from "@/lib/utils";
import type { JournalAnalyticsEvaluationResponse } from "../types";

interface JournalEvaluationPanelProps {
  data: JournalAnalyticsEvaluationResponse | undefined;
  isLoading?: boolean;
  className?: string;
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function money(value: number): string {
  // Keep the sign explicit for losers (e.g. -$231.21); positives plain.
  return value < 0 ? `-${usd.format(Math.abs(value))}` : usd.format(value);
}

function percent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/** "7.2h / 0.2d / 455m" — same value expressed three ways, like the reference. */
function holdTime(seconds: number): string {
  const minutes = seconds / 60;
  const hours = seconds / 3600;
  const days = seconds / 86400;
  return `${hours.toFixed(1)}h / ${days.toFixed(1)}d / ${Math.round(minutes)}m`;
}

interface Row {
  label: string;
  value: React.ReactNode;
}

function StreakBadges({ streak }: { streak: string[] }) {
  if (!streak.length) return <span className="text-text-secondary">—</span>;
  return (
    <span className="flex items-center justify-end gap-1">
      {streak.map((outcome, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold tabular-nums",
            outcome === "W"
              ? "bg-[rgba(34,197,94,0.12)] text-success"
              : outcome === "L"
                ? "bg-[rgba(239,68,68,0.12)] text-danger"
                : "bg-chip-grey text-kpi-label",
          )}
          title={outcome === "W" ? "Win" : outcome === "L" ? "Loss" : "Breakeven"}
        >
          {outcome}
        </span>
      ))}
    </span>
  );
}

export function JournalEvaluationPanel({
  data,
  isLoading = false,
  className,
}: JournalEvaluationPanelProps) {
  const rows: Row[] = data
    ? [
        { label: "Total Number of Trades", value: data.total_trades },
        {
          label: "Avg. Profit per Trading Day",
          value: money(data.avg_profit_per_trading_day),
        },
        { label: "Biggest Winner", value: money(data.biggest_winner) },
        { label: "Biggest Loser", value: money(data.biggest_loser) },
        { label: "Total Fees", value: money(data.total_fees) },
        { label: "Avg. Hold Time", value: holdTime(data.avg_hold_seconds) },
        { label: "Winrate w/o BE", value: percent(data.winrate_wo_be) },
        { label: "ROI", value: percent(data.roi) },
        { label: "Max Drawdown", value: percent(data.max_drawdown_pct) },
        {
          label: "Winning / Losing Days",
          value: `${data.winning_days} / ${data.losing_days}`,
        },
        {
          label: "Trades Per Day / Week",
          value: `${data.trades_per_day.toFixed(2)} / ${data.trades_per_week.toFixed(2)}`,
        },
        {
          label: "Current Streak",
          value: <StreakBadges streak={data.recent_streak} />,
        },
      ]
    : [];

  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-xl bg-card-bg",
        className,
      )}
    >
      <div className="px-5 pt-4 pb-2">
        <h2 className="text-base font-bold text-text-primary">Evaluation</h2>
      </div>

      <div className="px-5 pb-4">
        {isLoading || !data ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-5 animate-pulse rounded bg-bg-tertiary/60"
              />
            ))}
          </div>
        ) : (
          <dl className="divide-y divide-border-primary">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 py-3"
              >
                <dt className="text-sm text-text-secondary">{row.label}</dt>
                <dd className="shrink-0 text-sm font-semibold tabular-nums text-text-primary">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
