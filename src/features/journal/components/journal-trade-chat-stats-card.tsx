import { ChevronDown, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "./journal-day-modal.utils";
import type { MetricRow } from "./journal-day-chat.types";

interface JournalTradeChatStatsCardProps {
  metrics: MetricRow[];
  netPnl: number;
}

function TagRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between text-sm font-semibold">
      <span className="text-text-secondary">{label}</span>
      <button className="inline-flex h-8 w-[68%] items-center justify-between rounded-full border-2 border-border-secondary px-4 text-text-tertiary">
        Add tags
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}

export function JournalTradeChatStatsCard({
  metrics,
  netPnl,
}: JournalTradeChatStatsCardProps) {
  return (
    <Card className="h-full border-0 bg-card-bg">
      <CardHeader className="border-b border-border-secondary p-6">
        <div className="flex items-center gap-3">
          <div
            className={`h-12 w-1 rounded-full ${
              netPnl >= 0 ? "bg-kpi-metric-positive" : "bg-danger"
            }`}
          />
          <div>
            <p className="mb-1 text-sm font-semibold text-text-secondary">
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
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between text-sm font-semibold"
          >
            <span className="text-text-secondary">{metric.label}</span>
            <span className={metric.valueClassName ?? "text-text-primary"}>
              {metric.value}
            </span>
          </div>
        ))}

        <TagRow label="Strategy" />
        <TagRow label="Mistakes" />
        <TagRow label="Custom" />

        <div className="flex items-center justify-between pt-2 text-sm font-semibold">
          <span className="text-text-secondary">Trade Rating</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="h-5 w-5 fill-text-tertiary text-text-tertiary"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
