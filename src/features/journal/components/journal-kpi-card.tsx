import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface JournalKpiCardProps {
  label: string;
  value: ReactNode;
  /** Chart/visual rendered flush-right, vertically centered. */
  chart: ReactNode;
  /** Optional info tooltip trigger shown after the label. */
  info?: ReactNode;
  /** Optional element shown after the label+info (e.g. a trade-count chip). */
  labelTrailing?: ReactNode;
  /** Sizing for the chart slot (defaults to shrink-to-content). */
  chartClassName?: string;
  className?: string;
}

/**
 * Shared KPI card shell per the premium spec:
 * - quiet card surface on the canvas, with a faint border and 12px radius
 * - 20px padding, label+number stacked LEFT, chart flush RIGHT, vertically centered
 * - number white #F4F4F5 (30px / 600), label grey #A1A1AA (14px / 500)
 */
export function JournalKpiCard({
  label,
  value,
  chart,
  info,
  labelTrailing,
  chartClassName,
  className,
}: JournalKpiCardProps) {
  return (
    <article
      className={cn(
        "flex min-h-[6.875rem] min-w-0 items-center justify-between gap-3 rounded-xl border border-border-primary bg-kpi-card-bg p-5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="text-sm font-medium leading-tight text-kpi-label">
            {label}
          </span>
          {info}
          {labelTrailing}
        </div>
        <p className="font-heading text-2xl font-semibold leading-none tabular-nums text-text-primary">
          {value}
        </p>
      </div>

      <div
        className={cn(
          "flex items-center justify-center",
          chartClassName ?? "shrink-0",
        )}
      >
        {chart}
      </div>
    </article>
  );
}
