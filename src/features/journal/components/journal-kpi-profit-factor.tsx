"use client";

import { cn } from "@/lib/utils";
import { JournalKpiInfo } from "./journal-kpi-info";
import { JournalKpiCard } from "./journal-kpi-card";

interface JournalKpiProfitFactorProps {
  profitFactor: number;
  className?: string;
}

const SEGMENT_COUNT = 10;
// Profit factor maps onto the segment bar over a 0–4 range (PF of 4+ fills all).
const PF_FULL_SCALE = 4;

export function JournalKpiProfitFactor({
  profitFactor,
  className,
}: JournalKpiProfitFactorProps) {
  const display = Number.isFinite(profitFactor) ? profitFactor.toFixed(2) : "—";
  const filled = Number.isFinite(profitFactor)
    ? Math.max(
        0,
        Math.min(
          SEGMENT_COUNT,
          Math.round((profitFactor / PF_FULL_SCALE) * SEGMENT_COUNT),
        ),
      )
    : 0;

  return (
    <JournalKpiCard
      className={className}
      label="Profit Factor"
      info={
        <JournalKpiInfo
          title="Profit Factor"
          description="Gross profits divided by gross losses for the selected period. Above 1.0 means total profits exceed total losses."
        />
      }
      value={display}
      chart={
        <div className="flex items-center gap-1">
          {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-3.5 w-1.5 rounded-[3px]",
                i < filled ? "bg-success" : "bg-neutral-grey",
              )}
              aria-hidden
            />
          ))}
        </div>
      }
    />
  );
}
