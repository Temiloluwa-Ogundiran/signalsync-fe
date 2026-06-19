"use client";

import { useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { asNumber } from "./journal-day-modal.utils";
import type { TradeHistoryRow } from "./journal-trade-history.types";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format/money";
import { useActiveAccountCurrency } from "../hooks/use-active-account-currency";
import Image from "next/image";

interface JournalTradeHistoryTableProps {
  rows: TradeHistoryRow[];
  onOpenJournal: (row: TradeHistoryRow) => void;
  canLoadMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

function formatPrice(value: number | string) {
  return asNumber(value).toFixed(2);
}

export function JournalTradeHistoryTable({
  rows,
  onOpenJournal,
  canLoadMore = false,
  isLoadingMore = false,
  onLoadMore,
}: JournalTradeHistoryTableProps) {
  const currency = useActiveAccountCurrency();

  const columns = useMemo<ColumnDef<TradeHistoryRow>[]>(
    () => [
      {
        accessorKey: "symbol",
        header: "Symbol",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            {row.original.symbol}
          </span>
        ),
      },
      {
        accessorKey: "direction",
        header: "Side",
        cell: ({ row }) => (
          <span className="text-sm font-semibold capitalize text-text-primary">
            {row.original.direction}
          </span>
        ),
      },
      {
        accessorKey: "open_price",
        header: "Open Price",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-text-primary">
            {formatPrice(row.original.open_price)}
          </span>
        ),
      },
      {
        accessorKey: "close_price",
        header: "Close Price",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-text-primary">
            {formatPrice(row.original.close_price)}
          </span>
        ),
      },
      {
        accessorKey: "openedDateLabel",
        header: "Open Time",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-text-primary">
            {row.original.openedDateLabel}
          </span>
        ),
      },
      {
        accessorKey: "closedDateLabel",
        header: "Close Time",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-text-primary">
            {row.original.closedDateLabel}
          </span>
        ),
      },
      {
        accessorKey: "volume",
        header: "Lot Size",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-text-primary">
            {asNumber(row.original.volume).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "net_profit",
        header: "Net Profit",
        cell: ({ row }) => {
          const net = asNumber(row.original.net_profit);
          return (
            <span
              className={cn(
                "text-sm font-semibold",
                net >= 0 ? "text-kpi-metric-positive" : "text-danger",
              )}
            >
              {net >= 0
                ? `+${formatMoney(net, { currency, fractionDigits: 2 })}`
                : formatMoney(net, { currency, fractionDigits: 2 })}
            </span>
          );
        },
      },
      {
        id: "journal",
        header: "Journal",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenJournal(row.original)}
              aria-label="Open trade journal"
              className="inline-flex cursor-pointer h-10 w-10 items-center justify-center rounded-full bg-bg-secondary text-text-primary transition-colors hover:bg-bg-hover"
            >
              <Image
                src={"/icons/journal/modal/journal.svg"}
                alt=""
                width={24}
                height={24}
                className={cn("h-5 w-5")}
              />
            </button>
          </div>
        ),
      },
    ],
    [onOpenJournal, currency],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-border-secondary/70 bg-bg-secondary">
      <div className="overflow-x-auto">
        <Table className="min-w-[1120px] border-separate border-spacing-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="h-[4.4rem] border-b border-border-secondary bg-bg-tertiary hover:bg-bg-tertiary"
              >
                {headerGroup.headers.map((header, index) => (
                  <TableHead
                    key={header.id}
                    className={`px-6 text-left text-base font-semibold text-text-secondary ${
                      index === 0 ? "rounded-tl-2xl" : ""
                    } ${index === headerGroup.headers.length - 1 ? "rounded-tr-2xl" : ""}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-[3.4rem] border-b border-border-secondary/85 bg-bg-secondary"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-bg-secondary">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 px-6 text-center text-sm text-text-secondary"
                >
                  No trades match the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex min-h-[4.4rem] items-center justify-between gap-3 border-t border-border-secondary/80 bg-bg-secondary px-4 py-3">
        <p className="text-sm font-semibold text-text-primary">
          Showing {rows.length} loaded trade{rows.length === 1 ? "" : "s"}
        </p>
        {canLoadMore ? (
          <Button
            type="button"
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="rounded-full"
          >
            {isLoadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Load more
          </Button>
        ) : null}
      </div>
    </section>
  );
}
