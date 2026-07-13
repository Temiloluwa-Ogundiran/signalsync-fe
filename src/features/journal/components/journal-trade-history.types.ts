import type { JournalTrade } from "../types";

export interface TradeHistoryRow extends JournalTrade {
  openedDateLabel: string;
  closedDateLabel: string;
  tradingDate: string;
}
