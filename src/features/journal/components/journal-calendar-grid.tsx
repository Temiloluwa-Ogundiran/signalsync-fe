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
            className="rounded-lg border border-border-primary/55 bg-card-bg py-1 sm:py-1.5 text-center text-[0.6rem] sm:text-[0.68rem] font-semibold text-text-primary"
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
                className="min-h-[4.2rem] sm:min-h-22 rounded-md border border-border-primary/45 bg-(--calendar-cell-neutral)/45"
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
                "group relative flex min-h-[4.2rem] sm:min-h-22 cursor-pointer flex-col justify-between rounded-md border border-border-primary/60 p-1 sm:p-2 text-right transition-all",
                day === selectedDay && "ring-2 ring-(--calendar-selected-ring)",
              )}
            >
              <div className="flex items-center justify-between w-full">
                {/* Left side: either journal activity icon or hover plus icon */}
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
                  
                  {/* Floating Add Trade indicator on hover (hidden on mobile, shown on md+ hover) */}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      const y = currentMonth.getFullYear();
                      const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
                      const dStr = String(day).padStart(2, "0");
                      openAddTradeModal(`${y}-${m}-${dStr}`);
                    }}
                    className="opacity-0 md:group-hover:opacity-100 p-0.5 rounded bg-accent/15 hover:bg-accent text-accent hover:text-white transition-all duration-150 cursor-pointer flex items-center justify-center"
                    title="Add trade manually for this day"
                  >
                    <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </span>
                </div>
                <span className="text-[0.58rem] sm:text-[0.65rem] font-semibold text-text-primary">{day}</span>
              </div>
              
              {stats ? (
                <div className="w-full">
                  <p
                    className={cn(
                      "mt-0.5 sm:mt-1 text-[0.68rem] sm:text-xs md:text-sm font-bold tracking-tight",
                      pnl > 0 && "text-success",
                      pnl < 0 && "text-danger",
                      pnl === 0 && "text-text-secondary",
                    )}
                  >
                    {compactMoney(pnl)}
                  </p>
                  <p className="text-[0.52rem] sm:text-[0.62rem] text-text-tertiary font-medium">
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
