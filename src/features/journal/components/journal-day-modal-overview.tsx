import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { JournalTrade } from "../types";
import type { JournalDaySummary } from "./journal-day-modal.types";
import {
  asNumber,
  buildProfitFactor,
  formatClock,
  formatCurrency,
} from "./journal-day-modal.utils";

interface JournalDayModalOverviewProps {
  summary: JournalDaySummary;
  trades: JournalTrade[];
  currency: string;
}

export function JournalDayModalOverview({
  summary,
  trades,
  currency,
}: JournalDayModalOverviewProps) {
  const sortedTrades = useMemo(
    () =>
      [...trades].sort(
        (a, b) =>
          new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime(),
      ),
    [trades],
  );

  const pnlCurveData = useMemo(() => {
    const open: { step: number; time: string; cumulativePnl: number } = {
      step: 0,
      time: "Open",
      cumulativePnl: 0,
    };
    const byTrade = sortedTrades.reduce<
      { step: number; time: string; cumulativePnl: number }[]
    >((acc, trade, index) => {
      const previous = acc.length
        ? (acc[acc.length - 1]?.cumulativePnl ?? 0)
        : 0;
      acc.push({
        step: index + 1,
        time: formatClock(trade.closed_at),
        cumulativePnl: previous + asNumber(trade.net_profit),
      });
      return acc;
    }, []);
    return [open, ...byTrade];
  }, [sortedTrades]);

  const lastCumulative =
    pnlCurveData.length > 0
      ? pnlCurveData[pnlCurveData.length - 1]?.cumulativePnl ?? 0
      : summary.grossPnl;

  const chartConfig = {
    cumulativePnl: {
      label: "Profit/Loss",
      color:
        lastCumulative < 0 ? "var(--danger)" : "var(--kpi-metric-positive)",
    },
  } satisfies ChartConfig;

  const profitFactor = useMemo(() => buildProfitFactor(trades), [trades]);

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <section className="rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">
            Profit/Loss
          </h3>
          <span className="text-xs text-text-secondary">
            Cumulative by closed trade
          </span>
        </div>

        <div className="h-50 w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={pnlCurveData}
              margin={{ left: 8, right: 8, top: 4, bottom: 4 }}
            >
              <defs>
                <linearGradient id="dayPnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-cumulativePnl)"
                    stopOpacity={0.45}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-cumulativePnl)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="var(--border-secondary)"
              />
              <XAxis
                dataKey="step"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                tickFormatter={(v) => (Number(v) === 0 ? "Open" : String(v))}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                tickFormatter={(value: number) => {
                  const n = typeof value === "number" ? value : Number(value);
                  const absPart = Math.abs(n).toLocaleString(undefined, {
                    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
                  });
                  if (n < 0) return `-$${absPart}`;
                  return `$${absPart}`;
                }}
              />
              <Tooltip
                formatter={(value) =>
                  formatCurrency(
                    typeof value === "number" ? value : Number(value ?? 0),
                    currency,
                  )
                }
                labelFormatter={(label) => {
                  const n = Number(label);
                  if (n === 0) return "Session open";
                  return `Trade #${n}`;
                }}
                contentStyle={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "12px",
                  color: "var(--text-primary)",
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativePnl"
                stroke="var(--color-cumulativePnl)"
                strokeWidth={2.5}
                fill="url(#dayPnlGradient)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </section>

      <section className="rounded-2xl p-4">
        <div className="grid gap-4 text-sm h-full">
          <Row label="Total Trades" value={summary.totalTrades} />
          <Row label="Win Rate" value={`${summary.winRate.toFixed(2)}%`} />
          <Row
            label="Gross P&L"
            value={formatCurrency(summary.grossPnl, currency)}
            className={
              summary.grossPnl >= 0 ? "text-kpi-metric-positive" : "text-danger"
            }
          />
          <Row
            label="Starting Balance"
            value={
              summary.dayStartBalance == null
                ? "--"
                : formatCurrency(summary.dayStartBalance, currency)
            }
          />
          <Row
            label="Ending Balance"
            value={
              summary.dayEndBalance == null
                ? "--"
                : formatCurrency(summary.dayEndBalance, currency)
            }
          />
        </div>
      </section>

      <section className="rounded-2xl p-4">
        <div className="grid gap-4 text-sm h-full">
          <Row label="Winners" value={summary.winners} />
          <Row label="Losers" value={summary.losers} />
          <Row
            label="Commissions"
            value={formatCurrency(summary.commissions, currency)}
          />
          <Row
            label="Profit Factor"
            value={profitFactor == null ? "--" : profitFactor.toFixed(2)}
          />
          <Row label="Volumes" value={summary.volume.toFixed(2)} />
          <Row label="Avg. Hold Time" value={summary.avgHoldTime} />
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-text-secondary">{label}</p>
      <p
        className={["font-semibold text-text-primary", className]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
