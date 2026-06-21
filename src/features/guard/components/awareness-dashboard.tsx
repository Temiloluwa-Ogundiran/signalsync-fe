"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon } from "@hugeicons/core-free-icons";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { GuardMonitor } from "../types";
import {
  SIGNAL_WORD,
  STATUS_LABEL,
  signalDot,
  signalText,
  signalTint,
  statusSignal,
} from "../lib/status";
import { DistanceMeter } from "./distance-meter";

/**
 * The Guard "alarm" surface. Three things only: am I safe (traffic light), how
 * close to each line am I (distance meters), and the alert feed. Everything is
 * rendered verbatim from `GET /guard/accounts/{id}/monitor` — no math here. Pass
 * plan / consistency / chart / positions live on the Plan tab, not this screen.
 */
export function AwarenessDashboard({ monitor }: { monitor: GuardMonitor }) {
  const signal = statusSignal(monitor.status, monitor.breached);

  return (
    <div className="space-y-4">
      {/* Status hero — the traffic light */}
      <Card>
        <CardContent
          className={cn(
            "flex flex-wrap items-center gap-3 py-5",
            signalTint(signal),
          )}
        >
          <span
            className="inline-block h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: signalDot(signal) }}
          />
          <span className={cn("text-xl font-bold tracking-tight", signalText(signal))}>
            {SIGNAL_WORD[signal]}
          </span>
          <span className="text-sm text-text-secondary">
            — {STATUS_LABEL[monitor.status]}
          </span>
          <span className="ml-auto flex items-center gap-2 text-xs text-text-tertiary">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            Watching live
          </span>
        </CardContent>
      </Card>

      {/* The one-line coach nudge */}
      {monitor.nudge && (
        <p className="px-1 text-sm text-text-secondary">{monitor.nudge}</p>
      )}

      {/* Distance to each line — the core insight */}
      <Card>
        <CardContent className="space-y-5 pt-5">
          <DistanceMeter line={monitor.lines.daily} />
          <DistanceMeter line={monitor.lines.maxDD} />

          {(monitor.lines.personalDaily || monitor.lines.personalDD) && (
            <div className="space-y-4 border-t border-border-primary pt-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Your stricter limits
              </p>
              {monitor.lines.personalDaily && (
                <DistanceMeter line={monitor.lines.personalDaily} compact />
              )}
              {monitor.lines.personalDD && (
                <DistanceMeter line={monitor.lines.personalDD} compact />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert feed */}
      <Card>
        <CardContent className="space-y-3 pt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
              Alerts
            </h3>
            <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
              <HugeiconsIcon icon={Mail01Icon} size={13} className="text-brand" />
              Email on
            </span>
          </div>

          {monitor.alerts.length === 0 ? (
            <p className="py-3 text-center text-sm text-text-tertiary">
              — no warnings today —
            </p>
          ) : (
            <div className="max-h-64 space-y-0 overflow-y-auto">
              {monitor.alerts.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 border-b border-border-primary py-2.5 text-sm last:border-none"
                >
                  <span className="shrink-0 pt-0.5 font-mono text-[11px] text-text-tertiary">
                    {new Date(a.ts).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="leading-snug text-text-secondary">
                    {a.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
