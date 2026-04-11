import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatCurrency } from "./journal-day-modal.utils";
import type { CurvePoint } from "./journal-day-chat.types";

export type JournalDayChartValueScale = "currency" | "percent";

interface JournalDayChatPnlChartCardProps {
  title: string;
  data: CurvePoint[];
  seriesKey: "runningPnl" | "accountBalance";
  /** Percent scale for ROI-style curves; currency for $ P&L / balance. */
  valueScale?: JournalDayChartValueScale;
}

function formatPercentValue(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded}%`;
}

export function JournalDayChatPnlChartCard({
  title,
  data,
  seriesKey,
  valueScale = "currency",
}: JournalDayChatPnlChartCardProps) {
  const instanceId = useId().replace(/:/g, "");
  const gradientId =
    seriesKey === "runningPnl"
      ? `journalDayPnlGradient-${instanceId}`
      : `journalDayBalanceGradient-${instanceId}`;

  const lastValue = data.length ? (data[data.length - 1]?.value ?? 0) : 0;
  const values = data.map((d) => d.value);
  const minV = values.length ? Math.min(...values) : 0;
  const maxV = values.length ? Math.max(...values) : 0;
  const crossesZero = minV < 0 && maxV > 0;

  const strokeColor = useMemo(() => {
    if (seriesKey === "accountBalance") {
      return "var(--kpi-metric-positive)";
    }
    return lastValue < 0 ? "var(--danger)" : "var(--kpi-metric-positive)";
  }, [seriesKey, lastValue]);

  const chartConfig = useMemo(
    () =>
      ({
        [seriesKey]: {
          label: title,
          color: strokeColor,
        },
      }) satisfies ChartConfig,
    [seriesKey, title, strokeColor],
  );

  const colorVar = `var(--color-${seriesKey})`;

  const tickFormatter = (value: number) => {
    if (valueScale === "percent") {
      return formatPercentValue(value);
    }
    const n = typeof value === "number" ? value : Number(value);
    const absPart = Math.abs(n).toLocaleString(undefined, {
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    });
    if (n < 0) return `-$${absPart}`;
    return `$${absPart}`;
  };

  const tooltipFormatter = (value: unknown) => {
    const n = typeof value === "number" ? value : Number(value ?? 0);
    if (valueScale === "percent") {
      return formatPercentValue(n);
    }
    return formatCurrency(n);
  };

  return (
    <Card className="border-0 bg-card-bg">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[19.6rem] pt-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorVar} stopOpacity={0.45} />
                <stop offset="95%" stopColor={colorVar} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="var(--border-secondary)"
            />
            {crossesZero ? (
              <ReferenceLine
                y={0}
                stroke="var(--text-tertiary)"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
              />
            ) : null}
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
              tickFormatter={tickFormatter}
            />
            <Tooltip
              formatter={tooltipFormatter}
              contentStyle={{
                background: "var(--card-bg)",
                border: "1px solid var(--border-primary)",
                borderRadius: "12px",
                color: "var(--text-primary)",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colorVar}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
