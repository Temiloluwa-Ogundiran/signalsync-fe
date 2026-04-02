import type { JournalAnalyticsCalendarDay } from "../types";

export interface TradeOutcomeCounts {
  wins: number;
  losses: number;
  breakeven: number;
}

export function aggregateTradeOutcomes(
  days: JournalAnalyticsCalendarDay[] | undefined,
): TradeOutcomeCounts {
  if (!days?.length) {
    return { wins: 0, losses: 0, breakeven: 0 };
  }

  let wins = 0;
  let losses = 0;

  for (const day of days) {
    wins += day.win_count;
    losses += day.loss_count;
  }

  const breakeven = days.reduce((sum, day) => {
    const be = day.trade_count - day.win_count - day.loss_count;
    return sum + Math.max(0, be);
  }, 0);

  return { wins, losses, breakeven };
}
