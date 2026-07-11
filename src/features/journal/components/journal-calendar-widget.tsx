"use client";

import { JournalCalendarHeader } from "./journal-calendar-header";
import { JournalCalendarGrid } from "./journal-calendar-grid";
import { JournalWeekSummaryColumn } from "./journal-week-summary-column";
import { useCalendarSettingsStore } from "../store/calendar-settings-store";
import { useActiveAccountCurrency } from "../hooks/use-active-account-currency";
import { cn } from "@/lib/utils";
import type { JournalCalendarDayStat } from "../types";

interface JournalCalendarWidgetProps {
  monthLabel: string;
  daysInMonth: number;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  dayStats: Record<number, JournalCalendarDayStat>;
  monthStartOffset: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  currentMonth: Date;
}

export function JournalCalendarWidget({
  monthLabel,
  daysInMonth,
  selectedDay,
  onSelectDay,
  dayStats,
  monthStartOffset,
  onPrevMonth,
  onNextMonth,
  currentMonth,
}: JournalCalendarWidgetProps) {
  const showWeekSummary = useCalendarSettingsStore((s) => s.showWeekSummary);
  const currency = useActiveAccountCurrency();
  const totalCells = Math.ceil((monthStartOffset + daysInMonth) / 7) * 7;
  const weekRows = Array.from({ length: totalCells / 7 }, (_, rowIndex) =>
    Array.from({ length: 7 }, (_, colIndex) => {
      const index = rowIndex * 7 + colIndex;
      const day = index - monthStartOffset + 1;
      return day >= 1 && day <= daysInMonth ? day : null;
    }),
  );
  const weeklyTotals = weekRows.map((week) =>
    week.reduce<number>(
      (acc, day) => acc + (day ? (dayStats[day]?.pnl ?? 0) : 0),
      0,
    ),
  );
  const monthlyPnl = Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0);
  const activeDays = Object.values(dayStats).filter((day) => day.trades > 0).length;

  return (
    <section className="min-w-0 rounded-xl bg-card-bg">
      <JournalCalendarHeader
        monthLabel={monthLabel}
        monthlyPnl={monthlyPnl}
        activeDays={activeDays}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        currency={currency}
      />
      <div
        className={cn(
          "grid min-w-0 gap-4 p-3",
          showWeekSummary && "lg:grid-cols-[minmax(0,1fr)_6rem]",
        )}
      >
        <JournalCalendarGrid
          dayStats={dayStats}
          daysInMonth={daysInMonth}
          selectedDay={selectedDay}
          monthStartOffset={monthStartOffset}
          onSelectDay={onSelectDay}
          currentMonth={currentMonth}
          currency={currency}
        />
        {showWeekSummary ? (
          <JournalWeekSummaryColumn
            weeklyTotals={weeklyTotals}
            currency={currency}
          />
        ) : null}
      </div>
    </section>
  );
}

