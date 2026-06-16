import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useCalendarSettingsStore } from "../store/calendar-settings-store";

interface JournalCalendarHeaderProps {
  monthLabel: string;
  monthlyPnl: number;
  activeDays: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function compactMoney(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs < 1000) {
    return `${sign}$${abs.toLocaleString("en-US", {
      minimumFractionDigits: abs < 1 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  }

  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(abs);
  return `${sign}$${compact}`;
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
        <CalendarSettings />
      </div>
    </header>
  );
}

/** Calendar settings popover (gear in the header). */
function CalendarSettings() {
  const showWeekSummary = useCalendarSettingsStore((s) => s.showWeekSummary);
  const setShowWeekSummary = useCalendarSettingsStore(
    (s) => s.setShowWeekSummary,
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Calendar settings"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary cursor-pointer"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 rounded-xl border border-hairline bg-popover p-1.5"
      >
        <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
          Calendar settings
        </p>
        <div className="flex items-center justify-between gap-3 rounded-lg px-2 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">
              Weekly summary
            </p>
            <p className="text-xs text-text-secondary">
              Show a weekly P&amp;L column
            </p>
          </div>
          <Switch
            checked={showWeekSummary}
            onCheckedChange={setShowWeekSummary}
            aria-label="Toggle weekly summary"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

