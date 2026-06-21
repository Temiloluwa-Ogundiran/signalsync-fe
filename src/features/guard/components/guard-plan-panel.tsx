"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Target02Icon,
  ChartLineData01Icon,
  CalendarCheckIn01Icon,
  BalanceScaleIcon,
  ChartDownIcon,
  AiMagicIcon,
} from "@hugeicons/core-free-icons";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { GuardMonitor } from "../types";
import { formatMoney, formatPct } from "../lib/status";
import { GuardEquityChart } from "./equity-chart";

/**
 * The opt-in "Plan" tab — the pacing/coaching view (pass plan, consistency,
 * intraday equity). Kept off the main alarm screen so it doesn't compete with
 * the one question that matters: am I safe? Every number is from the BE.
 */
export function GuardPlanPanel({ monitor }: { monitor: GuardMonitor }) {
  const { challenge } = monitor;
  const plan = challenge.plan;

  return (
    <div className="space-y-4">
      {/* Pass progress + plan */}
      <Card>
        <CardContent className="space-y-3 pt-5">
          <PanelHead icon={Target02Icon} title="PASS PROGRESS" />
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <HugeiconsIcon icon={BalanceScaleIcon} size={14} className="text-brand" />
            <span>Profit target</span>
            <b className="ml-auto font-mono">
              {formatMoney(challenge.profit)} / {formatMoney(challenge.target)}
            </b>
          </div>
          <Bar
            value={
              challenge.target > 0
                ? Math.min(1, Math.max(0, challenge.profit / challenge.target))
                : 0
            }
            full={challenge.profit >= challenge.target}
          />

          <div className="flex items-center gap-2 pt-1 text-sm text-text-secondary">
            <HugeiconsIcon icon={CalendarCheckIn01Icon} size={14} className="text-brand" />
            <span>Trading days</span>
            <span className="ml-auto font-mono">
              {challenge.days_traded}
              {challenge.days_owed > 0 && (
                <span className="text-text-tertiary"> ({challenge.days_owed} owed)</span>
              )}
            </span>
          </div>

          {challenge.consistency && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <HugeiconsIcon icon={ChartDownIcon} size={14} className="text-brand" />
              <span>Consistency</span>
              <b
                className={cn(
                  "ml-auto font-mono",
                  challenge.consistency.share > challenge.consistency.cap
                    ? "text-danger"
                    : "text-success",
                )}
              >
                {formatPct(challenge.consistency.share)} of{" "}
                {formatPct(challenge.consistency.cap)} cap
              </b>
            </div>
          )}

          {plan && (
            <div className="flex items-start gap-2 border-t border-border-primary pt-3 text-sm text-text-secondary">
              <HugeiconsIcon
                icon={AiMagicIcon}
                size={14}
                className="mt-0.5 shrink-0 text-brand"
              />
              <span>
                {challenge.to_go > 0 ? (
                  <>
                    {formatMoney(challenge.to_go)} to go · aim{" "}
                    {formatMoney(plan.band_lo)}–{formatMoney(plan.band_hi)}/day
                    {plan.ceil_day > 0 && (
                      <> · keep any single day under {formatMoney(plan.ceil_day)}</>
                    )}
                  </>
                ) : challenge.passed ? (
                  "Target hit and days satisfied — you're clear. Protect it."
                ) : (
                  "Target hit — trade your remaining days to satisfy min-days."
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intraday equity */}
      <Card>
        <CardContent className="pt-5">
          <div className="mb-1 flex items-center justify-between">
            <PanelHead icon={ChartLineData01Icon} title="INTRADAY EQUITY" />
            <div className="flex gap-3 text-[10px] text-text-tertiary">
              <Legend color="var(--warning)" label="daily floor" />
              <Legend color="var(--red)" label="max dd" />
            </div>
          </div>
          <GuardEquityChart chart={monitor.chart} status={monitor.status} />
        </CardContent>
      </Card>
    </div>
  );
}

function PanelHead({ icon, title }: { icon: typeof Target02Icon; title: string }) {
  return (
    <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
      <HugeiconsIcon icon={icon} size={13} className="text-text-tertiary" />
      <span>{title}</span>
    </div>
  );
}

function Bar({ value, full }: { value: number; full: boolean }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{
          width: `${value * 100}%`,
          backgroundColor: full ? "var(--green)" : "var(--brand)",
        }}
      />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-2.5 rounded"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
