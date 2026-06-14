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

export function JournalCalendarHeader({
  monthLabel,
  monthlyPnl,
  activeDays,
  onPrevMonth,
  onNextMonth,
}: JournalCalendarHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-3 py-2">
      <div className="flex items-center rounded-lg border border-border-primary">
        <button
          onClick={onPrevMonth}
          className="inline-flex h-9 w-9 items-center justify-center rounded-l-lg text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[7.5rem] border-x border-border-primary px-4 py-1.5 text-center text-sm font-semibold text-text-primary">
          {monthLabel}
        </span>
        <button
          onClick={onNextMonth}
          className="inline-flex h-9 w-9 items-center justify-center rounded-r-lg text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-text-secondary">Monthly stats:</span>
        <span
          className={cn(
            "font-semibold tabular-nums",
            monthlyPnl >= 0 ? "text-success" : "text-danger",
          )}
        >
          {compactMoney(monthlyPnl)}
        </span>
        <span className="text-text-secondary tabular-nums">{activeDays} days</span>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary">
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

