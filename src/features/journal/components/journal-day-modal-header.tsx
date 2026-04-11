import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { JournalDaySummary } from "./journal-day-modal.types";
import { formatCurrency } from "./journal-day-modal.utils";

interface JournalDayModalHeaderProps {
  dayTitle: string;
  summary: JournalDaySummary;
}

export function JournalDayModalHeader({
  dayTitle,
  summary,
}: JournalDayModalHeaderProps) {
  return (
    <DialogHeader className="border-b border-border-primary px-8 py-4 flex items-start justify-center">
      <DialogTitle className="flex items-center font-heading gap-5 text-[24px] font-bold text-text-primary">
        <span>{dayTitle}</span>
        <span className="inline-block size-2 rounded-full bg-text-tertiary/80" />
        <span
          className={
            summary.grossPnl >= 0 ? "text-kpi-metric-positive" : "text-danger"
          }
        >
          Net P&L {formatCurrency(summary.grossPnl)}
        </span>
      </DialogTitle>
    </DialogHeader>
  );
}
