import type { JournalTrade } from "../types";

export interface JournalDaySummary {
  totalTrades: number;
  winners: number;
  losers: number;
  breakeven: number;
  winRate: number;
  grossPnl: number;
  commissions: number;
  volume: number;
  dayStartBalance: number | null;
  dayEndBalance: number | null;
}

export interface JournalDayTradeRow extends JournalTrade {
  journalMessageCount: number;
}
