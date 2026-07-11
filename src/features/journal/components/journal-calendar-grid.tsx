import Image from "next/image";

import { cn } from "@/lib/utils";
import type { JournalCalendarDayStat } from "../types";
import { formatCalendarMoney } from "./calendar-money";

const JOURNAL_CELL_ICON_SRC = "/icons/journal/modal/journal.svg";

interface JournalCalendarGridProps {
  dayStats: Record<number, JournalCalendarDayStat>;
  daysInMonth: number;
  selectedDay: number;
  monthStartOffset: number;
  onSelectDay: (day: number) => void;
  currentMonth: Date;
  currency: string;
}

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];

function heatStyle(value: number) {
  if (!value) return {};
  // Flat equal-weight wash: win/loss are distinguished by hue, not magnitude,
  // so green and red days read as equal-weight siblings (both at 12% token).
  return {
    backgroundColor:
      value > 0
        ? "var(--calendar-cell-win-bg)"
        : "var(--calendar-cell-loss-bg)",
  };
}

export function JournalCalendarGrid({
  dayStats,
  daysInMonth,
  selectedDay,
  monthStartOffset,
  onSelectDay,
  currentMonth,
  currency,
}: JournalCalendarGridProps) {

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

  return (
    <div className="space-y-1">
      <div className="grid min-w-0 grid-cols-7 gap-1.5">
        {DAY_NAMES.map((dayName) => (
          <div
            key={dayName}
            className="py-1 text-center text-[0.6rem] sm:text-[0.68rem] font-medium uppercase text-text-secondary"
          >
            {dayName}
          </div>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-7 gap-1.5">
        {cells.map((cell, index) => {
          // Out-of-month trailing/leading days: filled surface + hatch texture.
          if (!cell.inMonth) {
            return (
              <div
                key={`out-${index}`}
                className="calendar-hatch relative flex min-h-[4.4rem] sm:min-h-[5rem] flex-col rounded-lg border border-transparent bg-card-bg p-2 text-right"
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
              type="button"
              aria-pressed={day === selectedDay}
              onClick={() => onSelectDay(day)}
              style={pnl !== 0 ? heatStyle(pnl) : undefined}
              className={cn(
                "group relative flex min-h-[4.4rem] sm:min-h-[5rem] cursor-pointer flex-col rounded-lg border border-border-primary bg-(--calendar-cell-neutral) p-2 text-right transition-[border-color,box-shadow,transform] hover:border-border-secondary active:scale-[0.97]",
                day === todayDay &&
                  "ring-2 ring-(--calendar-selected-ring) ring-offset-0",
                day === selectedDay && day !== todayDay &&
                  "border-accent ring-2 ring-accent/40",
              )}
            >
              <div className="flex items-center justify-between w-full">
                {/* Left side: journal activity icon */}
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
                </div>
                <span className="text-[0.62rem] sm:text-[0.72rem] font-semibold tabular-nums text-text-secondary">
                  {day}
                </span>
              </div>

              {stats ? (
                <div className="flex w-full flex-1 flex-col items-center justify-center text-center">
                  <p
                    className={cn(
                      "text-[0.68rem] sm:text-xs md:text-sm font-bold tabular-nums",
                      pnl > 0 && "text-success",
                      pnl < 0 && "text-danger",
                      pnl === 0 && "text-text-secondary",
                    )}
                  >
                    {formatCalendarMoney(pnl, currency)}
                  </p>
                  <p className="text-[0.52rem] sm:text-[0.62rem] text-text-secondary font-medium tabular-nums">
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
