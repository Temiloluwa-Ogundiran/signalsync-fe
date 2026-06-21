"use client";

import { cn } from "@/lib/utils";

import type { GuardLine } from "../types";
import { formatMoney, meterColorFromConsumed } from "../lib/status";

/**
 * One breach line rendered as a distance meter — the headline insight. Shows the
 * money room left, a consumed-fraction track, and the floor. All numbers come
 * straight from the BE; nothing is computed here. `compact` renders the muted,
 * smaller variant used for the personal (amber) lines.
 */
export function DistanceMeter({
  line,
  compact = false,
}: {
  line: GuardLine;
  compact?: boolean;
}) {
  const consumed = Math.min(100, Math.max(0, line.consumed_pct));
  const color = meterColorFromConsumed(line.consumed_pct);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span
          className={cn(
            "text-text-secondary",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {line.label}
        </span>
        <span
          className={cn(
            "font-mono font-semibold tabular-nums",
            compact ? "text-sm" : "text-lg",
          )}
          style={{ color }}
        >
          {formatMoney(Math.max(0, line.room))} left
        </span>
      </div>

      <div
        className={cn(
          "relative mt-2 overflow-hidden rounded-full bg-surface-subtle",
          compact ? "h-1.5" : "h-2.5",
        )}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${consumed}%`, backgroundColor: color }}
        />
      </div>

      {!compact && (
        <div className="mt-1.5 flex justify-between text-xs text-text-tertiary">
          <span>
            floor{" "}
            <b className="font-mono text-text-secondary">
              {formatMoney(line.floor)}
            </b>
          </span>
          <span>
            <b className="font-mono" style={{ color }}>
              {line.consumed_pct.toFixed(0)}%
            </b>{" "}
            used
          </span>
        </div>
      )}
    </div>
  );
}
