"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CrosshairIcon,
  Target02Icon,
  ChartLineData01Icon,
  Notification03Icon,
  Mail01Icon,
  TelegramIcon,
  SmartPhone01Icon,
  CalendarCheckIn01Icon,
  BalanceScaleIcon,
  ChartDownIcon,
  AiMagicIcon,
} from "@hugeicons/core-free-icons";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { GuardMonitor } from "../types";
import {
  STATUS_LABEL,
  formatMoney,
  formatPct,
  statusText,
  statusTint,
} from "../lib/status";
import { DistanceMeter } from "./distance-meter";
import { GuardEquityChart } from "./equity-chart";

/**
 * The awareness dashboard — the headline Guard surface. Every number is rendered
 * verbatim from `GET /guard/accounts/{id}/monitor`; no buffer math happens here.
 */
export function AwarenessDashboard({ monitor }: { monitor: GuardMonitor }) {
  const { challenge } = monitor;
  const plan = challenge.plan;
  const dayPnl = monitor.equity - monitor.balance;

  return (
    <div className="space-y-4">
      {/* Status ribbon */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 rounded-xl border border-border-primary px-4 py-3 text-sm",
          statusTint(monitor.status),
        )}
      >
        <span className={cn("font-semibold", statusText(monitor.status))}>
          {monitor.status}
        </span>
        <span className="text-text-secondary">
          {STATUS_LABEL[monitor.status]}
        </span>
        <span className="ml-auto flex items-center gap-2 text-xs text-text-tertiary">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
          Monitoring live
          <span className="rounded border border-border-primary px-1.5 py-0.5 uppercase tracking-wide">
            read-only
          </span>
        </span>
      </div>

      {/* Coach nudge */}
      <Card>
        <CardContent className="flex items-start gap-2.5 py-3.5 text-sm text-text-secondary">
          <HugeiconsIcon
            icon={AiMagicIcon}
            size={16}
            className="mt-0.5 shrink-0 text-brand"
          />
          <span>{monitor.nudge}</span>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Distance to breach — the headline */}
        <Card>
          <CardContent className="space-y-4 pt-5">
            <PanelHead icon={CrosshairIcon} title="DISTANCE TO BREACH" />
            <DistanceMeter line={monitor.lines.daily} />
            <DistanceMeter line={monitor.lines.maxDD} />
            {monitor.lines.personalDaily && (
              <DistanceMeter line={monitor.lines.personalDaily} />
            )}
            {monitor.lines.personalDD && (
              <DistanceMeter line={monitor.lines.personalDD} />
            )}
            <div className="grid grid-cols-4 gap-3 border-t border-border-primary pt-3">
              <Vital label="Equity" value={formatMoney(monitor.equity)} highlight />
              <Vital label="Balance" value={formatMoney(monitor.balance)} />
              <Vital label="Peak" value={formatMoney(monitor.peak)} />
              <Vital label="Day P&L" value={formatMoney(dayPnl, true)} />
            </div>
          </CardContent>
        </Card>

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
              <HugeiconsIcon
                icon={CalendarCheckIn01Icon}
                size={14}
                className="text-brand"
              />
              <span>Trading days</span>
              <span className="ml-auto font-mono">
                {challenge.days_traded}
                {challenge.days_owed > 0 && (
                  <span className="text-text-tertiary">
                    {" "}
                    ({challenge.days_owed} owed)
                  </span>
                )}
              </span>
            </div>

            {challenge.consistency && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <HugeiconsIcon
                  icon={ChartDownIcon}
                  size={14}
                  className="text-brand"
                />
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
      </div>

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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardContent className="space-y-3 pt-5">
            <PanelHead icon={Notification03Icon} title="ALERTS" />
            <div className="flex gap-2">
              <Channel icon={Mail01Icon} name="Email" enabled />
              <Channel icon={TelegramIcon} name="Telegram" soon />
              <Channel icon={SmartPhone01Icon} name="Push" soon />
            </div>
            <div className="max-h-44 space-y-0 overflow-y-auto">
              {monitor.alerts.length === 0 && (
                <p className="py-3 text-sm text-text-tertiary">
                  No alerts yet. We&apos;ll email you the moment a line tightens.
                </p>
              )}
              {monitor.alerts.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 border-b border-border-primary py-2 text-xs last:border-none"
                >
                  <span className="shrink-0 font-mono text-[10px] text-text-tertiary">
                    {new Date(a.ts).toLocaleTimeString("en-GB")}
                  </span>
                  <span className="leading-snug text-text-secondary">
                    {a.message}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Open positions (read-only) */}
        <Card>
          <CardContent className="space-y-2 pt-5">
            <div className="mb-1 flex items-center justify-between">
              <PanelHead icon={CrosshairIcon} title="OPEN POSITIONS" />
              <span className="text-[11px] text-text-tertiary">
                {monitor.positions.length} · read-only
              </span>
            </div>
            <div className="grid grid-cols-[1.4fr_0.8fr_1fr_1fr] gap-2 text-[10px] uppercase tracking-wide text-text-tertiary">
              <span>Symbol</span>
              <span>Side</span>
              <span className="text-right">Lots</span>
              <span className="text-right">P&L</span>
            </div>
            {monitor.positions.length === 0 && (
              <p className="py-2 text-sm text-text-tertiary">No open positions.</p>
            )}
            {monitor.positions.map((p) => (
              <div
                key={p.ticket}
                className="grid grid-cols-[1.4fr_0.8fr_1fr_1fr] gap-2 border-b border-border-primary py-2 text-sm last:border-none"
              >
                <span className="font-medium text-text-primary">{p.symbol}</span>
                <span
                  className={
                    p.side === "Sell" ? "text-danger" : "text-success"
                  }
                >
                  {p.side ?? "—"}
                </span>
                <span className="text-right font-mono text-text-secondary">
                  {p.volume.toFixed(2)}
                </span>
                <span
                  className={cn(
                    "text-right font-mono",
                    p.profit < 0 ? "text-danger" : "text-success",
                  )}
                >
                  {formatMoney(p.profit, true)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PanelHead({
  icon,
  title,
}: {
  icon: typeof CrosshairIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
      <HugeiconsIcon icon={icon} size={13} className="text-text-tertiary" />
      <span>{title}</span>
    </div>
  );
}

function Vital({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-text-tertiary">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-sm",
          highlight ? "font-semibold text-text-primary" : "text-text-secondary",
        )}
      >
        {value}
      </span>
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

function Channel({
  icon,
  name,
  enabled,
  soon,
}: {
  icon: typeof Mail01Icon;
  name: string;
  enabled?: boolean;
  soon?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs",
        enabled
          ? "border-brand/40 bg-brand/5 text-text-primary"
          : "border-border-primary bg-card-bg text-text-tertiary",
      )}
      aria-disabled={soon}
      title={soon ? "Coming soon" : undefined}
    >
      <HugeiconsIcon
        icon={icon}
        size={13}
        className={enabled ? "text-brand" : "text-text-tertiary"}
      />
      {name}
      {soon && <span className="text-[9px] uppercase">soon</span>}
    </div>
  );
}
