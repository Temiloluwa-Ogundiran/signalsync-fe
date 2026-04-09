import type { JournalTrade } from "../types";

export type TradeHistoryDirection = JournalTrade["direction"];

export interface TradeHistoryRow extends JournalTrade {
  openedDateLabel: string;
  closedDateLabel: string;
  tradingDate: string;
}
