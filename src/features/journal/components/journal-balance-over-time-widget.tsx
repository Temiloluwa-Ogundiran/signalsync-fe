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
import { computePaddedBalanceDomain } from "../lib/balance-chart-domain";
import type { JournalAnalyticsBalanceHistoryPoint } from "../types";
import { asNumber, formatCurrency } from "./journal-day-modal.utils";

type RangeOption = "1D" | "1W" | "1M" | "1Y" | "All";

interface JournalBalanceOverTimeWidgetProps {
  points: JournalAnalyticsBalanceHistoryPoint[];
  isLoading?: boolean;
  selectedRange: RangeOption;
  onRangeChange: (range: RangeOption) => void;
  /** Tighter layout when shown beside other analytics widgets. */
  compact?: boolean;
}

const OPTIONS: RangeOption[] = ["1D", "1W", "1M", "1Y", "All"];

function localCalendarDayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function buildBalanceChartRows(
  rawPoints: JournalAnalyticsBalanceHistoryPoint[],
  selectedRange: RangeOption,
): { label: string; value: number; atMs: number }[] {
  const sorted = [...rawPoints].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  let prevDayKey: string | null = null;

  return sorted.map((point) => {
    const date = new Date(point.timestamp);
    const atMs = date.getTime();
    const value = asNumber(point.balance as number | string);

    if (selectedRange === "1D") {
      return {
        label: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        value,
        atMs,
      };
    }

    const dayKey = localCalendarDayKey(date);
    const isNewCalendarDay = prevDayKey === null || dayKey !== prevDayKey;
    prevDayKey = dayKey;

    const label = isNewCalendarDay
      ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

    return { label, value, atMs };
  });
}

export function JournalBalanceOverTimeWidget({
  points,
  isLoading,
  selectedRange,
  onRangeChange,
  compact = false,
}: JournalBalanceOverTimeWidgetProps) {
  const data = useMemo(
    () => buildBalanceChartRows(points, selectedRange),
    [points, selectedRange],
  );

  const canPlotChart = data.length >= 2;

  const yDomain = useMemo(
    () => computePaddedBalanceDomain(data.map((d) => d.value)),
    [data],
  );

  const headlineBalance = useMemo(() => {
    if (!points.length) return null;
    const sorted = [...points].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const last = sorted[sorted.length - 1];
    return asNumber(last.balance as number | string);
  }, [points]);

  return (
    <section className="flex h-full min-h-0 flex-col justify-between rounded-xl bg-kpi-card-bg ring-1 ring-border-primary/60">
      <header
        className={cn(
          "flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border-secondary px-4",
          "py-3",
        )}
      >
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold tabular-nums tracking-tight text-text-primary">
            {headlineBalance == null ? "—" : formatCurrency(headlineBalance)}
          </p>
          <p className="text-xs text-text-secondary">Balance</p>
        </div>
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
        ) : !canPlotChart ? (
          <div className="flex h-full max-w-sm flex-col items-center justify-center gap-1 px-4 text-center text-sm text-text-secondary">
            <p>No closed trades in this range yet.</p>
            <p className="text-xs text-text-tertiary">
              Sync your account or widen the range to include days with closed
              trades or daily balance snapshots.
            </p>
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
                domain={yDomain ?? ["auto", "auto"]}
                tick={{
                  fill: "var(--text-secondary)",
                  fontSize: 10,
                  fontWeight: 600,
                }}
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Tooltip
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as { atMs?: number } | undefined;
                  if (row?.atMs == null) return "";
                  return new Date(row.atMs).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                }}
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
