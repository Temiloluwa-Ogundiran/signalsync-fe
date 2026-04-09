"use client";

import { useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  FilePenLine,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
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

interface JournalTradeHistoryTableProps {
  rows: TradeHistoryRow[];
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onOpenJournal: (row: TradeHistoryRow) => void;
}

function formatPrice(value: number | string) {
  return asNumber(value).toFixed(2);
}

export function JournalTradeHistoryTable({
  rows,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
  onFirstPage,
  onLastPage,
  onOpenJournal,
}: JournalTradeHistoryTableProps) {
  const columns = useMemo<ColumnDef<TradeHistoryRow>[]>(
    () => [
      {
        accessorKey: "symbol",
        header: "Symbol",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-text-primary">
            {row.original.symbol}
          </span>
        ),
      },
      {
        accessorKey: "direction",
        header: "Type",
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
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-text-primary">
            {formatPrice(row.original.net_profit)}
          </span>
        ),
      },
      {
        id: "journal",
        header: "Journal",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onOpenJournal(row.original)}
            aria-label="Open trade journal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary text-text-primary transition-colors hover:bg-bg-hover"
          >
            <FilePenLine className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [onOpenJournal],
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

      <div className="flex h-[4.4rem] items-center justify-end gap-1 border-t border-border-secondary/80 bg-bg-secondary px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onFirstPage}
          disabled={page <= 1}
          className="rounded-full text-text-primary disabled:text-text-tertiary"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onPrevPage}
          disabled={page <= 1}
          className="rounded-full text-text-primary disabled:text-text-tertiary"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="px-2 text-sm font-semibold text-text-primary">
          Page {Math.max(page, 1)} of {Math.max(totalPages, 1)}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onNextPage}
          disabled={page >= totalPages}
          className="rounded-full text-text-primary disabled:text-text-tertiary"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onLastPage}
          disabled={page >= totalPages}
          className="rounded-full text-text-primary disabled:text-text-tertiary"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
