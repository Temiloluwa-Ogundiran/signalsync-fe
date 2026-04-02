import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalCalendarHeaderProps {
  monthLabel: string;
  monthlyPnl: number;
  activeDays: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function compactMoney(value: number) {
  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
  return `${value >= 0 ? "+" : "-"}$${compact}`;
}

export function JournalCalendarHeader({
  monthLabel,
  monthlyPnl,
  activeDays,
  onPrevMonth,
  onNextMonth,
}: JournalCalendarHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-primary/60 px-3 py-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevMonth}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-card-bg text-text-primary"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button className="rounded-full border border-border-primary px-3 py-1 text-sm font-semibold text-text-primary">
          TODAY
        </button>
        <button
          onClick={onNextMonth}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-card-bg text-text-primary"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="ml-2 text-sm font-semibold text-text-primary">{monthLabel}</span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-text-secondary">Monthly stats:</span>
        <span
          className={cn(
            "font-semibold",
            monthlyPnl >= 0 ? "text-(--calendar-selected-ring)" : "text-danger",
          )}
        >
          {compactMoney(monthlyPnl)}
        </span>
        <span className="text-text-primary">{activeDays} days</span>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-card-bg text-text-primary">
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

