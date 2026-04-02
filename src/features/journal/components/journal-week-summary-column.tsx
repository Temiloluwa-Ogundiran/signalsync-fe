import { cn } from "@/lib/utils";

interface JournalWeekSummaryColumnProps {
  weeklyTotals: number[];
}

function formatCompact(value: number) {
  if (!value) return "$0";
  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
  return `${value >= 0 ? "+" : "-"}$${compact}`;
}

export function JournalWeekSummaryColumn({
  weeklyTotals,
}: JournalWeekSummaryColumnProps) {
  return (
    <div className="grid grid-rows-6 gap-1.5">
      {weeklyTotals.map((weekPnl, index) => (
        <div
          key={`week-${index + 1}`}
          className="rounded-md border border-border-primary/55 bg-card-bg px-2 py-2"
        >
          <p className="text-[0.62rem] uppercase text-text-tertiary">Week {index + 1}</p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold",
              weekPnl > 0 && "text-success",
              weekPnl < 0 && "text-danger",
              weekPnl === 0 && "text-text-secondary",
            )}
          >
            {formatCompact(weekPnl)}
          </p>
          <p className="text-[0.65rem] text-text-tertiary">{Math.abs(weekPnl) ? "6 days" : "0 days"}</p>
        </div>
      ))}
    </div>
  );
}

