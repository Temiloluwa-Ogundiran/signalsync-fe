import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatCurrency } from "./journal-day-modal.utils";
import type { CurvePoint } from "./journal-day-chat.types";

interface JournalDayChatPnlChartCardProps {
  title: string;
  data: CurvePoint[];
  seriesKey: "runningPnl" | "accountBalance";
}

const chartConfig = {
  runningPnl: {
    label: "Running P&L",
    color: "var(--kpi-metric-positive)",
  },
  accountBalance: {
    label: "Account Balance",
    color: "var(--kpi-metric-positive)",
  },
} satisfies ChartConfig;

export function JournalDayChatPnlChartCard({
  title,
  data,
  seriesKey,
}: JournalDayChatPnlChartCardProps) {
  const gradientId = seriesKey === "runningPnl" ? "journalDayPnlGradient" : "journalDayBalanceGradient";
  const colorVar = `var(--color-${seriesKey})`;

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
              tickFormatter={(value: number) =>
                `$${Math.abs(value).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}`
              }
            />
            <Tooltip
              formatter={(value) =>
                formatCurrency(typeof value === "number" ? value : Number(value ?? 0))
              }
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
