"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "./journal-day-modal.utils";
import type { MetricRow } from "./journal-day-chat.types";
import { useUpdateTradeRating } from "../hooks/use-journal-tags";

interface JournalTradeChatStatsCardProps {
  metrics: MetricRow[];
  netPnl: number;
  tradeId: string;
  rating?: number;
  accountId?: string;
}

export function JournalTradeChatStatsCard({
  metrics,
  netPnl,
  tradeId,
  rating = 0,
  accountId,
}: JournalTradeChatStatsCardProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const updateTradeRating = useUpdateTradeRating(accountId);

  const handleRatingClick = async (selectedRating: number) => {
    if (updateTradeRating.isPending) return;
    try {
      await updateTradeRating.mutateAsync({
        tradeId,
        rating: selectedRating,
      });
    } catch (error) {
      console.error("Failed to update rating:", error);
    }
  };

  const activeRating = hoverRating ?? rating;

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
        {/* Core trade metrics */}
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

        {/* Trade rating */}
        <div className="flex items-center justify-between border-t border-border-secondary pt-6 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">Trade Rating</span>
            {updateTradeRating.isPending && (
              <Loader2 className="h-3 w-3 animate-spin text-text-tertiary" />
            )}
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const starValue = index + 1;
              const isFilled = starValue <= activeRating;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleRatingClick(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(null)}
                  disabled={updateTradeRating.isPending}
                  className="focus:outline-none transition-transform duration-150 hover:scale-125 disabled:opacity-50"
                  aria-label={`Rate ${starValue} stars`}
                >
                  <Star
                    className={`h-5 w-5 transition-all duration-200 ${
                      isFilled
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]"
                        : "text-text-tertiary hover:text-amber-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
