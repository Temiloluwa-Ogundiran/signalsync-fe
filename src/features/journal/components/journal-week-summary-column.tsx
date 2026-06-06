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
    <div className="grid grid-cols-2 gap-1.5 min-[480px]:grid-cols-3 sm:grid-cols-5 lg:grid-cols-1 lg:grid-rows-6 lg:gap-1.5">
      {weeklyTotals.map((weekPnl, index) => (
        <div
          key={`week-${index + 1}`}
          className="rounded-md border border-border-primary/55 bg-card-bg px-2 py-1.5 lg:py-2"
        >
          <p className="text-[0.62rem] uppercase text-text-tertiary">W{index + 1}</p>
          <p
            className={cn(
              "mt-0.5 text-xs lg:text-sm font-semibold",
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

