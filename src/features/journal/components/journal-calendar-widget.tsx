"use client";

import { JournalCalendarHeader } from "./journal-calendar-header";
import { JournalCalendarGrid } from "./journal-calendar-grid";
import { JournalWeekSummaryColumn } from "./journal-week-summary-column";
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
}: JournalCalendarWidgetProps) {
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
    <section className="rounded-xl bg-card-bg ring-1 ring-border-primary/60">
      <JournalCalendarHeader
        monthLabel={monthLabel}
        monthlyPnl={monthlyPnl}
        activeDays={activeDays}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />
      <div className="grid gap-2 p-3 lg:grid-cols-[1fr_5.3rem]">
        <JournalCalendarGrid
          dayStats={dayStats}
          daysInMonth={daysInMonth}
          monthStartOffset={monthStartOffset}
          selectedDay={selectedDay}
          onSelectDay={onSelectDay}
        />
        <JournalWeekSummaryColumn weeklyTotals={weeklyTotals} />
      </div>
    </section>
  );
}

