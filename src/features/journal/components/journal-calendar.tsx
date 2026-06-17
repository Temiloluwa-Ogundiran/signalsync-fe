"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { formatMoney, formatMoneyCompactSigned } from "@/lib/format/money";
import type { JournalCalendarDayStat, JournalMonthHeaderStats } from "../types";

interface JournalCalendarProps {
  monthLabel: string;
  daysInMonth: number;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  dayStats: Record<number, JournalCalendarDayStat>;
  monthStartOffset?: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  headerStats: JournalMonthHeaderStats;
  isHeaderStatsLoading?: boolean;
  /** Broker account currency for money formatting (ISO-4217). */
  currency: string;
}

function getPnlTone(value: number) {
  if (value > 0) return "win";
  if (value < 0) return "loss";
  return "neutral";
}

function getWeekDays(selectedDay: number, daysInMonth: number) {
  const weekStart = Math.floor((selectedDay - 1) / 7) * 7 + 1;

  return Array.from({ length: 7 }, (_, index) => {
    const day = weekStart + index;
    return day <= daysInMonth ? day : null;
  });
}

function getHeatStyle(value: number, maxAbs: number) {
  if (!value || !maxAbs) return undefined;

  const intensity = Math.min(1, Math.abs(value) / maxAbs);
  const blend = 36 + intensity * 56;

  return {
    backgroundColor:
      value > 0
        ? `color-mix(in srgb, var(--calendar-cell-win-bg) ${blend.toFixed(1)}%, var(--calendar-cell-neutral))`
        : `color-mix(in srgb, var(--calendar-cell-loss-bg) ${blend.toFixed(1)}%, var(--calendar-cell-neutral))`,
  };
}

export function JournalCalendar({
  monthLabel,
  daysInMonth,
  selectedDay,
  onSelectDay,
  dayStats,
  monthStartOffset = 0,
  onPrevMonth,
  onNextMonth,
  headerStats,
  isHeaderStatsLoading = false,
  currency,
}: JournalCalendarProps) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const totalCells = Math.ceil((monthStartOffset + daysInMonth) / 7) * 7;
  const monthGrid = Array.from({ length: totalCells }, (_, index) => {
    const day = index - monthStartOffset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const weekRows = Array.from({ length: totalCells / 7 }, (_, rowIndex) =>
    monthGrid.slice(rowIndex * 7, rowIndex * 7 + 7),
  );

  const weeklyTotals: number[] = weekRows.map((week) =>
    week.reduce<number>(
      (sum, day) => sum + (day ? (dayStats[day]?.pnl ?? 0) : 0),
      0,
    ),
  );

  const maxAbsDayPnl = Math.max(
    1,
    ...Object.values(dayStats).map((day) => Math.abs(day.pnl)),
  );
  const maxAbsWeekPnl = Math.max(
    1,
    ...weeklyTotals.map((value) => Math.abs(value)),
  );

  const safeSelectedDay =
    selectedDay && selectedDay <= daysInMonth ? selectedDay : 1;
  const selectedStats = dayStats[safeSelectedDay] ?? null;
  const mobileWeek = getWeekDays(safeSelectedDay, daysInMonth);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border-primary bg-card-bg/80 p-2.5 shadow-sm backdrop-blur-sm">
        <div className="mb-4 flex justify-between items-center">
          <div className="inline-flex items-center bg-card-bg border border-border-primary rounded-lg p-1 shadow-sm w-fit">
            <button
              onClick={onPrevMonth}
              className="p-1 hover:bg-bg-tertiary rounded text-text-tertiary"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-4 font-bold text-sm text-text-primary">
              {monthLabel}
            </span>
            <button
              onClick={onNextMonth}
              className="p-1 hover:bg-bg-tertiary rounded text-text-tertiary"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="justify-self-start lg:justify-self-end">
            <div
              className={cn(
                "grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl border px-3 py-2 text-xs sm:grid-cols-4",
                headerStats.profits >= 0
                  ? "border-success/25 bg-success-light/70"
                  : "border-danger/25 bg-danger-light/70",
              )}
            >
              {isHeaderStatsLoading ? (
                <div className="col-span-full inline-flex items-center gap-2 py-1 text-text-secondary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading stats...
                </div>
              ) : (
                <>
                  <div>
                    <p className="uppercase tracking-wide text-text-tertiary">
                      Trades
                    </p>
                    <p className="text-sm font-semibold text-text-primary">
                      {headerStats.trades}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-text-tertiary">
                      Wins
                    </p>
                    <p className="text-sm font-semibold text-text-primary">
                      {headerStats.wins}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-text-tertiary">
                      Profits
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        headerStats.profits >= 0
                          ? "text-(--calendar-pnl-win-text)"
                          : "text-(--calendar-pnl-loss-text)",
                      )}
                    >
                      {headerStats.profits >= 0 ? "+" : "-"}
                      {formatMoney(Math.abs(headerStats.profits), {
                        currency,
                        fractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-text-tertiary">
                      Percent
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        headerStats.percent >= 0
                          ? "text-(--calendar-pnl-win-text)"
                          : "text-(--calendar-pnl-loss-text)",
                      )}
                    >
                      {headerStats.percent.toFixed(2)}%
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-8 md:gap-1.5">
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="rounded-xl bg-bg-tertiary/50 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-text-tertiary"
            >
              {dayName}
            </div>
          ))}
          <div className="rounded-xl bg-bg-tertiary/50 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-text-tertiary">
            Week PnL
          </div>
        </div>

        <div className="mt-1 hidden md:flex md:flex-col md:gap-1.5">
          {weekRows.map((week, rowIndex) => {
            const weeklyPnl = weeklyTotals[rowIndex] ?? 0;
            const weeklyTone = getPnlTone(weeklyPnl);

            return (
              <div
                key={`week-row-${rowIndex}`}
                className="grid grid-cols-8 gap-1.5"
              >
                {week.map((day, columnIndex) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${rowIndex}-${columnIndex}`}
                        className="min-h-28 rounded-xl border border-border-primary/45 bg-(--calendar-cell-neutral)/50"
                      />
                    );
                  }

                  const stats = dayStats[day];
                  const tone = stats ? getPnlTone(stats.pnl) : "neutral";
                  const isSelected = day === selectedDay;

                  return (
                    <button
                      key={`day-${day}`}
                      onClick={() => onSelectDay(day)}
                      style={
                        stats
                          ? getHeatStyle(stats.pnl, maxAbsDayPnl)
                          : undefined
                      }
                      className={cn(
                        "group relative flex min-h-28 flex-col justify-between rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--calendar-selected-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
                        "border-border-primary/60 bg-(--calendar-cell-neutral)",
                        isSelected &&
                          "ring-2 ring-inset ring-(--calendar-selected-ring) shadow-sm",
                      )}
                    >
                      <span className="self-end text-xs font-medium text-(--calendar-cell-date)">
                        {day}
                      </span>

                      {stats ? (
                        <div className="space-y-0.5">
                          <div
                            className={cn(
                              "text-right text-base font-semibold leading-tight",
                              tone === "win" &&
                                "text-(--calendar-pnl-win-text)",
                              tone === "loss" &&
                                "text-(--calendar-pnl-loss-text)",
                              tone === "neutral" && "text-text-secondary",
                            )}
                          >
                            {formatMoneyCompactSigned(stats.pnl, currency)}
                          </div>
                          <div className="text-right text-xs text-(--calendar-cell-subtle)">
                            {stats.trades}{" "}
                            {stats.trades === 1 ? "trade" : "trades"}
                          </div>
                        </div>
                      ) : null}
                    </button>
                  );
                })}

                <div
                  style={getHeatStyle(weeklyPnl, maxAbsWeekPnl)}
                  className="min-h-28 rounded-xl border border-border-primary/60 bg-(--calendar-cell-neutral) px-2 py-3"
                >
                  <div className="h-full flex flex-col justify-center text-right">
                    <span className="text-[0.65rem] uppercase tracking-wide text-(--calendar-cell-subtle)">
                      Week {rowIndex + 1}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold leading-tight",
                        weeklyTone === "win" &&
                          "text-(--calendar-pnl-win-text)",
                        weeklyTone === "loss" &&
                          "text-(--calendar-pnl-loss-text)",
                        weeklyTone === "neutral" && "text-text-secondary",
                      )}
                    >
                      {weeklyPnl
                        ? formatMoneyCompactSigned(weeklyPnl, currency)
                        : formatMoney(0, { currency, compact: true })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="md:hidden">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            {monthLabel}
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {mobileWeek.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`mobile-empty-${index}`}
                    className="h-12 rounded-lg bg-bg-tertiary/35"
                  />
                );
              }

              const stats = dayStats[day];
              const isSelected = day === selectedDay;
              const tone = stats ? getPnlTone(stats.pnl) : "neutral";

              return (
                <button
                  key={`mobile-day-${day}`}
                  onClick={() => onSelectDay(day)}
                  style={
                    stats ? getHeatStyle(stats.pnl, maxAbsDayPnl) : undefined
                  }
                  className={cn(
                    "h-12 rounded-lg border border-border-primary/60 text-sm font-semibold transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--calendar-selected-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
                    isSelected
                      ? "bg-(--calendar-selected-fill) text-text-primary ring-2 ring-inset ring-(--calendar-selected-ring)"
                      : tone === "win"
                        ? "text-(--calendar-pnl-win-text)"
                        : tone === "loss"
                          ? "text-(--calendar-pnl-loss-text)"
                          : "bg-(--calendar-cell-neutral) text-(--calendar-cell-date)",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 rounded-2xl border border-border-primary/70 bg-(--calendar-cell-neutral) px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text-primary">
                Day {safeSelectedDay}
              </p>
              {selectedStats ? (
                <p
                  className={cn(
                    "text-sm font-semibold",
                    selectedStats.pnl >= 0
                      ? "text-(--calendar-pnl-win-text)"
                      : "text-(--calendar-pnl-loss-text)",
                  )}
                >
                  {formatMoneyCompactSigned(selectedStats.pnl, currency)}
                </p>
              ) : null}
            </div>
            {selectedStats ? (
              <p className="mt-1 text-xs text-(--calendar-cell-subtle)">
                {selectedStats.trades} trades • {selectedStats.winRate}% win
                rate
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
