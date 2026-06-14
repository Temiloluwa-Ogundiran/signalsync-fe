import Image from "next/image";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { JournalCalendarDayStat } from "../types";
import { useJournalUiStore } from "../store/journal-ui-store";

const JOURNAL_CELL_ICON_SRC = "/icons/journal/modal/journal.svg";

interface JournalCalendarGridProps {
  dayStats: Record<number, JournalCalendarDayStat>;
  daysInMonth: number;
  monthStartOffset: number;
  onSelectDay: (day: number) => void;
  currentMonth: Date;
}

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];

function heatStyle(value: number, maxAbs: number) {
  if (!value) return {};
  // Floor at 65% so even small winning/losing days read clearly, scaling up
  // to the full 14% token fill for the biggest days.
  const blend = 65 + Math.min(1, Math.abs(value) / Math.max(1, maxAbs)) * 35;
  return {
    backgroundColor:
      value > 0
        ? `color-mix(in srgb, var(--calendar-cell-win-bg) ${blend.toFixed(1)}%, var(--calendar-cell-neutral))`
        : `color-mix(in srgb, var(--calendar-cell-loss-bg) ${blend.toFixed(1)}%, var(--calendar-cell-neutral))`,
  };
}

function compactMoney(value: number) {
  const abs = Math.abs(value);
  if (abs < 1000) {
    return `${value >= 0 ? "+" : "-"}$${abs.toLocaleString("en-US", {
      minimumFractionDigits: abs < 1 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  }

  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(abs);
  return `${value >= 0 ? "+" : "-"}$${compact}`;
}

export function JournalCalendarGrid({
  dayStats,
  daysInMonth,
  monthStartOffset,
  onSelectDay,
  currentMonth,
}: JournalCalendarGridProps) {
  const openAddTradeModal = useJournalUiStore((s) => s.openAddTradeModal);

  // "Today" — only highlight when the displayed month is the current month.
  const now = new Date();
  const isCurrentMonth =
    currentMonth.getFullYear() === now.getFullYear() &&
    currentMonth.getMonth() === now.getMonth();
  const todayDay = isCurrentMonth ? now.getDate() : null;

  const daysInPrevMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    0,
  ).getDate();

  const totalCells = Math.ceil((monthStartOffset + daysInMonth) / 7) * 7;
  // Each cell carries its label number and whether it belongs to this month.
  const cells = Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - monthStartOffset + 1;
    if (dayOffset < 1) {
      return { label: daysInPrevMonth + dayOffset, day: null, inMonth: false };
    }
    if (dayOffset > daysInMonth) {
      return { label: dayOffset - daysInMonth, day: null, inMonth: false };
    }
    return { label: dayOffset, day: dayOffset, inMonth: true };
  });

  const maxAbsDayPnl = Math.max(
    1,
    ...Object.values(dayStats).map((stat) => Math.abs(stat.pnl)),
  );

  return (
    <div className="space-y-1">
      <div className="grid min-w-0 grid-cols-7 gap-1">
        {DAY_NAMES.map((dayName) => (
          <div
            key={dayName}
            className="py-1 text-center text-[0.6rem] sm:text-[0.68rem] font-medium uppercase tracking-wide text-text-secondary"
          >
            {dayName}
          </div>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          // Out-of-month trailing/leading days: filled surface + hatch texture.
          if (!cell.inMonth) {
            return (
              <div
                key={`out-${index}`}
                className="calendar-hatch relative flex min-h-[4.2rem] sm:min-h-[5.25rem] flex-col rounded-lg border border-transparent bg-card-bg p-2 text-right"
              >
                <span className="ml-auto flex h-5 w-5 items-center justify-center text-[0.58rem] sm:text-[0.65rem] font-medium tabular-nums text-text-tertiary">
                  {cell.label}
                </span>
              </div>
            );
          }

          const day = cell.day as number;
          const stats = dayStats[day];
          const pnl = stats?.pnl ?? 0;
          const trades = stats?.trades ?? 0;
          return (
            <button
              key={`day-${day}`}
              onClick={() => onSelectDay(day)}
              style={pnl !== 0 ? heatStyle(pnl, maxAbsDayPnl) : undefined}
              className={cn(
                "group relative flex min-h-[4.6rem] sm:min-h-[5.5rem] cursor-pointer flex-col rounded-lg border border-border-primary bg-(--calendar-cell-neutral) p-2 text-right transition-all hover:border-border-secondary",
                day === todayDay &&
                  "ring-2 ring-(--calendar-selected-ring) ring-offset-0",
              )}
            >
              <div className="flex items-center justify-between w-full">
                {/* Left side: journal activity icon or hover add-trade button */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {stats?.hasJournalActivity ? (
                    <span className="pointer-events-none flex h-3.5 w-3.5 items-center justify-center opacity-95" title="Has journal activity">
                      <Image
                        src={JOURNAL_CELL_ICON_SRC}
                        alt=""
                        width={14}
                        height={14}
                        className="object-contain h-3 w-3 sm:h-3.5 sm:w-3.5"
                        unoptimized
                        aria-hidden
                      />
                    </span>
                  ) : null}

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      const y = currentMonth.getFullYear();
                      const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
                      const dStr = String(day).padStart(2, "0");
                      openAddTradeModal(`${y}-${m}-${dStr}`);
                    }}
                    className="opacity-0 md:group-hover:opacity-100 p-0.5 rounded-md bg-bg-tertiary text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all duration-150 cursor-pointer flex items-center justify-center"
                    title="Add trade manually for this day"
                  >
                    <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </span>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-[0.58rem] sm:text-[0.65rem] font-semibold tabular-nums text-text-primary">
                  {day}
                </span>
              </div>

              {stats ? (
                <div className="flex w-full flex-1 flex-col items-center justify-center text-center">
                  <p
                    className={cn(
                      "text-[0.68rem] sm:text-xs md:text-sm font-bold tracking-tight tabular-nums",
                      pnl > 0 && "text-success",
                      pnl < 0 && "text-danger",
                      pnl === 0 && "text-text-secondary",
                    )}
                  >
                    {compactMoney(pnl)}
                  </p>
                  <p className="text-[0.52rem] sm:text-[0.62rem] text-text-tertiary font-medium tabular-nums">
                    <span>{trades}</span>
                    <span className="hidden sm:inline"> {trades === 1 ? "trade" : "trades"}</span>
                    <span className="inline sm:hidden">t</span>
                  </p>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
