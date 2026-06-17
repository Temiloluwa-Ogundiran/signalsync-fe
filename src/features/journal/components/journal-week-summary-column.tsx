import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format/money";
import { formatCalendarMoney } from "./calendar-money";

interface JournalWeekSummaryColumnProps {
  weeklyTotals: number[];
  currency: string;
}

export function JournalWeekSummaryColumn({
  weeklyTotals,
  currency,
}: JournalWeekSummaryColumnProps) {
  return (
    <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3 sm:grid-cols-5 lg:flex lg:h-full lg:flex-col lg:gap-2">
      {/* Header-row placeholder: mirrors the calendar's day-name row exactly so
          week summaries line up with day rows without a hardcoded spacer. */}
      <div
        className="hidden py-1 text-[0.6rem] sm:text-[0.68rem] lg:block lg:shrink-0"
        aria-hidden
      >
        &nbsp;
      </div>
      {weeklyTotals.map((weekPnl, index) => {
        return (
          <div
            key={`week-${index + 1}`}
            // Recessed: no border, pitch-black inset fill, so the rail reads
            // as a distinct summary sidebar — not another column of days.
            className="flex flex-col justify-center rounded-lg bg-card-bg px-2.5 py-2 lg:min-h-0 lg:flex-1"
          >
            <p className="text-[0.6rem] font-medium uppercase tracking-wide text-text-secondary">
              Week {index + 1}
            </p>
            <p
              className={cn(
                "mt-1 tabular-nums text-sm font-semibold leading-none",
                weekPnl > 0 && "text-success",
                weekPnl < 0 && "text-danger",
                // $0 / neutral weeks recede — muted grey, not a highlight.
                weekPnl === 0 && "text-text-secondary",
              )}
            >
              {weekPnl
                ? formatCalendarMoney(weekPnl, currency)
                : formatMoney(0, { currency, fractionDigits: 0 })}
            </p>
          </div>
        );
      })}
    </div>
  );
}

