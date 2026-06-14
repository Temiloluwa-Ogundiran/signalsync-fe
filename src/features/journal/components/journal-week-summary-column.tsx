import { cn } from "@/lib/utils";

interface JournalWeekSummaryColumnProps {
  weeklyTotals: number[];
  weeklyActiveDays: number[];
}

function formatCompact(value: number) {
  if (!value) return "$0";

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

export function JournalWeekSummaryColumn({
  weeklyTotals,
  weeklyActiveDays,
}: JournalWeekSummaryColumnProps) {
  return (
    <div className="grid grid-cols-2 gap-1 min-[480px]:grid-cols-3 sm:grid-cols-5 lg:flex lg:h-full lg:flex-col lg:gap-1">
      {/* Header-row placeholder: mirrors the calendar's day-name row exactly so
          week tiles line up with day rows without a hardcoded spacer height. */}
      <div
        className="hidden py-1 text-[0.6rem] sm:text-[0.68rem] lg:block lg:shrink-0"
        aria-hidden
      >
        &nbsp;
      </div>
      {weeklyTotals.map((weekPnl, index) => (
        <div
          key={`week-${index + 1}`}
          className="flex flex-col justify-center rounded-lg border border-border-primary bg-(--calendar-cell-neutral) px-2.5 py-2 lg:min-h-0 lg:flex-1"
        >
          <p className="text-[0.62rem] uppercase text-text-tertiary">W{index + 1}</p>
          <p
            className={cn(
              "mt-0.5 tabular-nums text-xs lg:text-sm font-semibold",
              weekPnl > 0 && "text-success",
              weekPnl < 0 && "text-danger",
              weekPnl === 0 && "text-text-secondary",
            )}
          >
            {formatCompact(weekPnl)}
          </p>
          <p className="text-[0.58rem] sm:text-[0.65rem] text-text-tertiary hidden min-[360px]:block">
            {weeklyActiveDays[index] ?? 0} day{(weeklyActiveDays[index] ?? 0) === 1 ? "" : "s"}
          </p>
        </div>
      ))}
    </div>
  );
}

