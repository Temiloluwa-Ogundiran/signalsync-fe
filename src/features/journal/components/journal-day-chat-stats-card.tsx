import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "./journal-day-modal.utils";
import type { MetricRow } from "./journal-day-chat.types";

interface JournalDayChatStatsCardProps {
  metrics: MetricRow[];
  netPnl: number;
  pnlPercentLabel: string;
}

export function JournalDayChatStatsCard({
  metrics,
  netPnl,
  pnlPercentLabel,
}: JournalDayChatStatsCardProps) {
  return (
    <Card className="h-full border-0 bg-card-bg">
      <CardHeader className="border-b border-border-secondary p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1.5 rounded-full bg-kpi-metric-positive" />
            <div>
              <p className="text-sm mb-1 font-semibold text-text-secondary">
                Net P&L
              </p>
              <CardTitle
                className={
                  netPnl >= 0 ? "text-kpi-metric-positive" : "text-danger"
                }
              >
                {formatCurrency(netPnl)}
              </CardTitle>
            </div>
          </div>
          <span className="text-sm font-semibold text-kpi-metric-positive">
            {pnlPercentLabel}
          </span>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 p-6">
        {metrics.map((metric, index) => (
          <div key={metric.label}>
            {(index === 4 || index === 10) && (
              <div className="mb-6 border-t border-border-secondary" />
            )}
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-text-secondary">{metric.label}</span>
              <span className={metric.valueClassName ?? "text-text-primary"}>
                {metric.value}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
