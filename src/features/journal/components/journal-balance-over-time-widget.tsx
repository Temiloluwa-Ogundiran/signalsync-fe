"use client";

import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import type { JournalAnalyticsBalanceHistoryPoint } from "../types";

type RangeOption = "1D" | "1W" | "1M" | "1Y" | "All";

interface BalancePoint {
  label: string;
  value: number;
}

interface JournalBalanceOverTimeWidgetProps {
  points: JournalAnalyticsBalanceHistoryPoint[];
  isLoading?: boolean;
  selectedRange: RangeOption;
  onRangeChange: (range: RangeOption) => void;
  /** Tighter layout when shown beside other analytics widgets. */
  compact?: boolean;
}

const OPTIONS: RangeOption[] = ["1D", "1W", "1M", "1Y", "All"];

export function JournalBalanceOverTimeWidget({
  points,
  isLoading,
  selectedRange,
  onRangeChange,
  compact = false,
}: JournalBalanceOverTimeWidgetProps) {
  const data = useMemo<BalancePoint[]>(
    () =>
      points.map((point) => {
        const date = new Date(point.timestamp);
        const label =
          selectedRange === "1D"
            ? date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
        return {
          label,
          value: point.balance,
        };
      }),
    [points, selectedRange],
  );

  return (
    <section className="flex h-full min-h-0 flex-col justify-between rounded-xl bg-kpi-card-bg ring-1 ring-border-primary/60">
      <header
        className={cn(
          "flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border-secondary px-4",
          "py-3",
        )}
      >
        <h3 className="text-base font-semibold text-text-primary">
          Balance Change Over Time
        </h3>
        <div className="flex items-center gap-1">
          {OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onRangeChange(option)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
                selectedRange === option
                  ? "bg-bg-secondary text-text-primary ring-1 ring-border-primary"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </header>
      <div
        className={cn(
          "px-3 pb-3 py-2 flex items-center justify-center",
          compact ? "h-84 shrink-0" : "h-84",
        )}
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-text-secondary">
            Loading balance history...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--text-secondary)",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--text-secondary)",
                  fontSize: 10,
                  fontWeight: 600,
                }}
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Tooltip
                formatter={(value) =>
                  `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-kpi-metric-positive)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
