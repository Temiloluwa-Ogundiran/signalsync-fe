"use client";

import { useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export interface MonthCalendarDay {
  /** day-of-month → net P&L for that day (only days with trades present). */
  pnl: number;
  trades: number;
}

interface JournalMonthCalendarProps {
  /** First day of the displayed month (any date within it works). */
  monthDate: Date;
  /** day-of-month (1-based) → stats. Missing keys render as empty cells. */
  dayStats: Record<number, MonthCalendarDay>;
  /** Currently selected day-of-month, or null. */
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Heat background: blends a win/loss tint toward the neutral cell by intensity. */
function heatStyle(value: number, maxAbs: number) {
  if (!value || !maxAbs) return undefined;
  const intensity = Math.min(1, Math.abs(value) / maxAbs);
  const blend = 32 + intensity * 58;
  return {
    backgroundColor:
      value > 0
        ? `color-mix(in srgb, var(--calendar-cell-win-bg) ${blend.toFixed(1)}%, var(--calendar-cell-neutral))`
        : `color-mix(in srgb, var(--calendar-cell-loss-bg) ${blend.toFixed(1)}%, var(--calendar-cell-neutral))`,
  };
}

export function JournalMonthCalendar({
  monthDate,
  dayStats,
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}: JournalMonthCalendarProps) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const monthLabel = monthDate
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();

  const totalDays = daysInMonth(year, month);
  const startOffset = new Date(year, month, 1).getDay(); // 0 = Sunday

  const cells = useMemo(() => {
    const total = Math.ceil((startOffset + totalDays) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const day = i - startOffset + 1;
      return day >= 1 && day <= totalDays ? day : null;
    });
  }, [startOffset, totalDays]);

  const maxAbs = useMemo(
    () => Math.max(1, ...Object.values(dayStats).map((d) => Math.abs(d.pnl))),
    [dayStats],
  );

  return (
    <div className="rounded-2xl bg-card-bg p-4 ring-1 ring-hairline">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-text-secondary">
          {monthLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="rounded-md p-1 text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="rounded-md p-1 text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {DAY_INITIALS.map((d, i) => (
          <div
            key={`dow-${i}`}
            className="text-center text-xs font-medium text-text-tertiary"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          const stats = dayStats[day];
          const isSelected = day === selectedDay;
          const tone = stats ? (stats.pnl >= 0 ? "win" : "loss") : "neutral";

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => onSelectDay(day)}
              style={stats ? heatStyle(stats.pnl, maxAbs) : undefined}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-[color,background-color,box-shadow]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--calendar-selected-ring)",
                stats
                  ? tone === "win"
                    ? "text-(--calendar-pnl-win-text)"
                    : "text-(--calendar-pnl-loss-text)"
                  : "bg-(--calendar-cell-neutral) text-text-tertiary",
                isSelected &&
                  "ring-2 ring-inset ring-(--calendar-selected-ring) font-bold",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
