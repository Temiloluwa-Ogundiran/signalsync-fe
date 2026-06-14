"use client";

import { formatNetPnlDisplay } from "../lib/journal-widget-mappers";
import { JournalKpiCard } from "./journal-kpi-card";

interface JournalKpiNetPnlProps {
  totalNetPnl: number;
  className?: string;
}

// No sparkline for now — the equity/cumulative-P&L curve is a deliberate
// future addition (trade-derived). The card shows the realized net P&L value.
export function JournalKpiNetPnl({
  totalNetPnl,
  className,
}: JournalKpiNetPnlProps) {
  return (
    <JournalKpiCard
      className={className}
      label="Net P&L"
      value={formatNetPnlDisplay(totalNetPnl)}
      chart={null}
    />
  );
}
