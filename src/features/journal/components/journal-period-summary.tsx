"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format/money";
import { useActiveAccountCurrency } from "../hooks/use-active-account-currency";

export interface PeriodSummary {
  /** Heading, e.g. "JUNE SO FAR". */
  title: string;
  netPnl: number;
  winRate: number; // 0–100
  profitFactor: number | null;
  daysJournaled: number;
  tradingDays: number;
}

function money(value: number, currency: string): string {
  // Whole-number amounts, in the account currency.
  return formatMoney(Math.round(value), { currency, fractionDigits: 0 });
}

export function JournalPeriodSummary({ summary }: { summary: PeriodSummary }) {
  const currency = useActiveAccountCurrency();
  return (
    <div className="rounded-2xl bg-card-bg p-5 ring-1 ring-hairline">
      <h3 className="mb-4 text-sm font-semibold tracking-wide text-text-secondary">
        {summary.title}
      </h3>

      <dl className="flex flex-col">
        <Row label="Net P&L">
          <span
            className={cn(
              "tabular-nums",
              summary.netPnl >= 0
                ? "text-kpi-metric-positive"
                : "text-danger",
            )}
          >
            {money(summary.netPnl, currency)}
          </span>
        </Row>
        <Row label="Win rate">
          <span className="tabular-nums text-text-primary">
            {summary.winRate.toFixed(0)}%
          </span>
        </Row>
        <Row label="Profit factor">
          <span className="tabular-nums text-text-primary">
            {summary.profitFactor === null
              ? "--"
              : summary.profitFactor.toFixed(2)}
          </span>
        </Row>
        <Row label="Days journaled" last>
          <span className="tabular-nums text-text-primary">
            {summary.daysJournaled}{" "}
            <span className="text-text-tertiary">/ {summary.tradingDays}</span>
          </span>
        </Row>
      </dl>
    </div>
  );
}

function Row({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3 text-sm font-semibold",
        !last && "border-b border-hairline",
      )}
    >
      <dt className="font-medium text-text-secondary">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
