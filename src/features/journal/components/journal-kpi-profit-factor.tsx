"use client";

import { cn } from "@/lib/utils";
import { useChartColors } from "@/lib/use-chart-colors";
import { JournalKpiInfo } from "./journal-kpi-info";
import { JournalKpiCard } from "./journal-kpi-card";

interface JournalKpiProfitFactorProps {
  /**
   * Trade-level profit factor (gross win / |gross loss| over individual closed
   * trades). `null` means there were no losing trades → render as "∞".
   */
  profitFactor: number | null;
  /** Total closed trades — distinguishes ∞ (no losses) from "—" (no trades). */
  tradeCount: number;
  className?: string;
}

const SEGMENTS = 9;
// PF is unbounded; clamp it onto the gauge against a fixed ceiling.
const SCALE_MAX = 4;
// Breakeven (PF = 1.0) sits at 1/SCALE_MAX across the 0–SCALE_MAX scale.
const BREAKEVEN_RATIO = 1 / SCALE_MAX;

export function JournalKpiProfitFactor({
  profitFactor,
  tradeCount,
  className,
}: JournalKpiProfitFactorProps) {
  const colors = useChartColors();

  // null → ∞ (no losses but trades exist); no trades at all → em dash.
  const isInfinite = profitFactor === null && tradeCount > 0;
  const display = isInfinite
    ? "∞"
    : profitFactor != null && Number.isFinite(profitFactor)
      ? // PF is unbounded; thin samples produce huge values (140, etc.). Cap the
        // shown number at the gauge ceiling so it reads "4.0+" instead of noise.
        profitFactor > SCALE_MAX
        ? `${SCALE_MAX.toFixed(1)}+`
        : profitFactor.toFixed(2)
      : "—";

  // fillRatio = min(PF / scaleMax, 1); ∞ fills the whole gauge.
  const fillRatio = isInfinite
    ? 1
    : profitFactor != null && Number.isFinite(profitFactor)
      ? Math.min(profitFactor / SCALE_MAX, 1)
      : 0;
  const segmentsLit = Math.round(fillRatio * SEGMENTS);

  return (
    <JournalKpiCard
      className={className}
      label="Profit Factor"
      info={
        <JournalKpiInfo
          title="Profit Factor"
          description="Gross profit divided by gross loss across individual closed trades. Above 1.0 means winners outweigh losers. ∞ means no losing trades."
        />
      }
      value={display}
      chart={
        <div className="relative flex items-center gap-1" aria-hidden>
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const lit = i < segmentsLit;
            // The leading lit segment gets the "bright tip" glow.
            const isTip = lit && i === segmentsLit - 1;
            return (
              <span
                key={i}
                className={cn(
                  "h-4 w-1.5 rounded-[3px] transition-colors",
                  // Lit uses the green token; unlit the app's gauge-grey token
                  // (the spec's #26262b is for a dark card — these cards are
                  // theme-adaptive, matching the sibling gauges).
                  lit ? "bg-success" : "bg-neutral-grey",
                )}
                style={
                  isTip ? { boxShadow: `0 0 6px 1px ${colors.win}` } : undefined
                }
              />
            );
          })}

          {/* Breakeven tick at PF = 1.0 (25% across the 0–4 scale). */}
          <span
            className="pointer-events-none absolute -top-1 bottom-[-0.25rem] w-px bg-text-tertiary/70"
            style={{ left: `${BREAKEVEN_RATIO * 100}%` }}
          />
        </div>
      }
    />
  );
}
