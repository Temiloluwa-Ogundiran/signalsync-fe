import type { JournalAnalyticsCalendarDay } from "../types";

export interface TradeOutcomeCounts {
  wins: number;
  losses: number;
  breakeven: number;
}

/** Days with trades in the period, by calendar `outcome` (for Daily Win % KPI). */
export interface DailyOutcomeCounts {
  winDays: number;
  lossDays: number;
  breakevenDays: number;
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

export function aggregateDailyOutcomes(
  days: JournalAnalyticsCalendarDay[] | undefined,
): DailyOutcomeCounts {
  if (!days?.length) {
    return { winDays: 0, lossDays: 0, breakevenDays: 0 };
  }

  let winDays = 0;
  let lossDays = 0;
  let breakevenDays = 0;

  for (const day of days) {
    switch (day.outcome) {
      case "win":
        winDays++;
        break;
      case "loss":
        lossDays++;
        break;
      case "breakeven":
        breakevenDays++;
        break;
      default:
        break;
    }
  }

  return { winDays, lossDays, breakevenDays };
}

/** Share of winning days among days that had trades (same window as calendar). */
export function dailyWinRatePercent(counts: DailyOutcomeCounts): number {
  const total = counts.winDays + counts.lossDays + counts.breakevenDays;
  if (total === 0) return 0;
  return (counts.winDays / total) * 100;
}
