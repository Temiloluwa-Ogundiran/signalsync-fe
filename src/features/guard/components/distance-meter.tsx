"use client";

import type { GuardLine } from "../types";
import { formatMoney, meterColorFromConsumed } from "../lib/status";

/**
 * One breach line rendered as a distance meter — the headline insight. Shows the
 * money room left, a consumed-fraction track, and the floor. All numbers come
 * straight from the BE; nothing is computed here.
 */
export function DistanceMeter({ line }: { line: GuardLine }) {
  const consumed = Math.min(100, Math.max(0, line.consumed_pct));
  const color = meterColorFromConsumed(line.consumed_pct);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-text-secondary">{line.label}</span>
        <span
          className="font-mono text-lg font-semibold tabular-nums"
          style={{ color }}
        >
          {formatMoney(Math.max(0, line.room))}
        </span>
      </div>

      <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-surface-subtle">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${consumed}%`, backgroundColor: color }}
        />
        {/* 20% / 40% reference ticks, mirroring the prototype. */}
        <span className="absolute inset-y-0 w-px bg-card-bg/70" style={{ left: "60%" }} />
        <span className="absolute inset-y-0 w-px bg-card-bg/70" style={{ left: "80%" }} />
      </div>

      <div className="mt-1.5 flex justify-between text-xs text-text-tertiary">
        <span>
          floor{" "}
          <b className="font-mono text-text-secondary">{formatMoney(line.floor)}</b>
        </span>
        <span>
          <b className="font-mono" style={{ color }}>
            {line.consumed_pct.toFixed(1)}%
          </b>{" "}
          consumed
        </span>
      </div>
    </div>
  );
}
