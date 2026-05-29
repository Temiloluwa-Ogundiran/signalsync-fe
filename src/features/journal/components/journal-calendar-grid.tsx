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
  selectedDay: number;
  onSelectDay: (day: number) => void;
  currentMonth: Date;
}

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];

function heatStyle(value: number, maxAbs: number) {
  if (!value) return {};
  const blend = 35 + Math.min(1, Math.abs(value) / Math.max(1, maxAbs)) * 60;
  return {
    backgroundColor:
      value > 0
        ? `color-mix(in srgb, var(--calendar-cell-win-bg) ${blend.toFixed(1)}%, var(--calendar-cell-neutral))`
        : `color-mix(in srgb, var(--calendar-cell-loss-bg) ${blend.toFixed(1)}%, var(--calendar-cell-neutral))`,
  };
}

function compactMoney(value: number) {
  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
  return `${value >= 0 ? "+" : "-"}$${compact}`;
}

export function JournalCalendarGrid({
  dayStats,
  daysInMonth,
  monthStartOffset,
  selectedDay,
  onSelectDay,
  currentMonth,
}: JournalCalendarGridProps) {
  const openAddTradeModal = useJournalUiStore((s) => s.openAddTradeModal);
  
  const totalCells = Math.ceil((monthStartOffset + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, index) => {
    const day = index - monthStartOffset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const maxAbsDayPnl = Math.max(
    1,
    ...Object.values(dayStats).map((stat) => Math.abs(stat.pnl)),
  );

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-7 gap-1.5">
        {DAY_NAMES.map((dayName) => (
          <div
            key={dayName}
            className="rounded-lg border border-border-primary/55 bg-card-bg py-1.5 text-center text-[0.68rem] font-semibold text-text-primary"
          >
            {dayName}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-22 rounded-md border border-border-primary/45 bg-(--calendar-cell-neutral)/45"
              />
            );
          }

          const stats = dayStats[day];
          const pnl = stats?.pnl ?? 0;
          const trades = stats?.trades ?? 0;
          return (
            <button
              key={`day-${day}`}
              onClick={() => onSelectDay(day)}
              style={heatStyle(pnl, maxAbsDayPnl)}
              className={cn(
                "group relative flex min-h-22 cursor-pointer flex-col justify-between rounded-md border border-border-primary/60 p-2 text-right transition-all",
                day === selectedDay && "ring-2 ring-(--calendar-selected-ring)",
              )}
            >
              {stats?.hasJournalActivity ? (
                <span className="pointer-events-none absolute left-1 bottom-1 z-1 flex h-4 w-4 items-center justify-center opacity-95">
                  <Image
                    src={JOURNAL_CELL_ICON_SRC}
                    alt=""
                    width={16}
                    height={16}
                    className="object-contain"
                    unoptimized
                    aria-hidden
                  />
                </span>
              ) : null}
              
              <div className="flex items-center justify-between w-full">
                {/* Floating Add Trade indicator on hover */}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    const y = currentMonth.getFullYear();
                    const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
                    const dStr = String(day).padStart(2, "0");
                    openAddTradeModal(`${y}-${m}-${dStr}`);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-accent/15 hover:bg-accent text-accent hover:text-white transition-all duration-150 cursor-pointer flex items-center justify-center"
                  title="Add trade manually for this day"
                >
                  <Plus className="h-3 w-3" />
                </span>
                <span className="text-[0.65rem] font-semibold text-text-primary">{day}</span>
              </div>
              
              {stats ? (
                <div className="w-full">
                  <p
                    className={cn(
                      "mt-1 text-sm font-bold tracking-tight",
                      pnl > 0 && "text-success",
                      pnl < 0 && "text-danger",
                      pnl === 0 && "text-text-secondary",
                    )}
                  >
                    {compactMoney(pnl)}
                  </p>
                  <p className="text-[0.62rem] text-text-tertiary font-medium">
                    {trades} {trades === 1 ? "trade" : "trades"}
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
