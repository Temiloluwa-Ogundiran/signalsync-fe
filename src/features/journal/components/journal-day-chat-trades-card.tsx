import { PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JournalTrade } from "@/features/journal/types";
import { asNumber, formatCurrency } from "./journal-day-modal.utils";
import { formatDateTime } from "./journal-day-chat.utils";

interface JournalDayChatTradesCardProps {
  trades: JournalTrade[];
  onOpenTradeJournal: (tradeId: string) => void;
}

export function JournalDayChatTradesCard({
  trades,
  onOpenTradeJournal,
}: JournalDayChatTradesCardProps) {
  return (
    <Card className="overflow-hidden border-0 bg-card-bg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-bg-tertiary/70">
              <TableHead>Symbol</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Open Price</TableHead>
              <TableHead>Close Price</TableHead>
              <TableHead>Open Time</TableHead>
              <TableHead>Close Time</TableHead>
              <TableHead>Lot Size</TableHead>
              <TableHead>Net P&L</TableHead>
              <TableHead className="text-right">Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length ? (
              trades.map((trade) => {
                const net = asNumber(trade.net_profit);
                return (
                  <TableRow key={trade.id} className="border-border-secondary">
                    <TableCell className="font-semibold">{trade.symbol}</TableCell>
                    <TableCell className="uppercase">{trade.direction}</TableCell>
                    <TableCell>{asNumber(trade.open_price).toFixed(2)}</TableCell>
                    <TableCell>{asNumber(trade.close_price).toFixed(2)}</TableCell>
                    <TableCell>{formatDateTime(trade.opened_at)}</TableCell>
                    <TableCell>{formatDateTime(trade.closed_at)}</TableCell>
                    <TableCell>{asNumber(trade.volume).toFixed(2)}</TableCell>
                    <TableCell
                      className={
                        net >= 0
                          ? "font-semibold text-kpi-metric-positive"
                          : "font-semibold text-danger"
                      }
                    >
                      {formatCurrency(net)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full border border-border-secondary"
                        onClick={() => onOpenTradeJournal(trade.id)}
                        aria-label="Open trade journal chat"
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-text-tertiary">
                  No trades for this day.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
