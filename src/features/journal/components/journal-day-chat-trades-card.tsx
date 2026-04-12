"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  type ColumnDef,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
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
import type { JournalTrade } from "@/features/journal/types";
import { useJournalDay } from "@/features/journal/hooks/use-journal-day-modal";
import { cn } from "@/lib/utils";
import { asNumber, formatCurrency } from "./journal-day-modal.utils";
import { formatDateTime } from "./journal-day-chat.utils";

const PAGE_SIZE = 5;

interface JournalDayChatTradesCardProps {
  accountId?: string;
  tradingDate?: string;
  onOpenTradeJournal: (tradeId: string) => void;
  className?: string;
}

function formatPrice(value: number | string) {
  return asNumber(value).toFixed(2);
}

export function JournalDayChatTradesCard({
  accountId,
  tradingDate,
  onOpenTradeJournal,
  className,
}: JournalDayChatTradesCardProps) {
  const enabled = !!(accountId && tradingDate);
  const dayQuery = useJournalDay(accountId, tradingDate, enabled);

  const trades = useMemo(
    () => dayQuery.data?.trades ?? [],
    [dayQuery.data?.trades],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [accountId, tradingDate, trades.length]);

  const columns = useMemo<ColumnDef<JournalTrade>[]>(
    () => [
      {
        accessorKey: "symbol",
        header: "Symbol",
        cell: ({ row }) => (
          <span className="text-xs font-semibold tracking-[0.04em] text-sidebar-nav-active-text">
            {row.original.symbol}
          </span>
        ),
      },
      {
        accessorKey: "direction",
        header: "Type",
        cell: ({ row }) => (
          <span className="text-xs font-semibold capitalize tracking-[0.04em] text-sidebar-nav-active-text">
            {row.original.direction}
          </span>
        ),
      },
      {
        accessorKey: "open_price",
        header: "Open Price",
        cell: ({ row }) => (
          <span className="text-xs font-semibold tracking-[0.04em] text-sidebar-nav-active-text">
            {formatPrice(row.original.open_price)}
          </span>
        ),
      },
      {
        accessorKey: "close_price",
        header: "Close Price",
        cell: ({ row }) => (
          <span className="text-xs font-semibold tracking-[0.04em] text-sidebar-nav-active-text">
            {formatPrice(row.original.close_price)}
          </span>
        ),
      },
      {
        id: "opened_at",
        header: "Open Time",
        cell: ({ row }) => (
          <span className="text-xs font-semibold tracking-[0.04em] text-sidebar-nav-active-text">
            {formatDateTime(row.original.opened_at)}
          </span>
        ),
      },
      {
        id: "closed_at",
        header: "Close Time",
        cell: ({ row }) => (
          <span className="text-xs font-semibold tracking-[0.04em] text-sidebar-nav-active-text">
            {formatDateTime(row.original.closed_at)}
          </span>
        ),
      },
      {
        accessorKey: "volume",
        header: "Lot Size",
        cell: ({ row }) => (
          <span className="text-xs font-semibold tracking-[0.04em] text-sidebar-nav-active-text">
            {asNumber(row.original.volume).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "net_profit",
        header: "Net P&L",
        cell: ({ row }) => {
          const net = asNumber(row.original.net_profit);
          return (
            <span
              className={cn(
                "text-xs font-semibold tracking-[0.04em]",
                net >= 0 ? "text-kpi-metric-positive" : "text-danger",
              )}
            >
              {formatCurrency(net)}
            </span>
          );
        },
      },
      {
        id: "journal",
        size: 120,
        minSize: 120,
        maxSize: 120,
        header: "Journal",
        cell: ({ row }) => (
          <div className="flex justify-end pr-1">
            <button
              type="button"
              onClick={() => onOpenTradeJournal(row.original.id)}
              aria-label="Open trade journal chat"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-kpi-card-bg text-sidebar-nav-active-text transition-colors hover:bg-bg-secondary cursor-pointer"
            >
              <Image
                src="/icons/journal/modal/journal.svg"
                alt=""
                width={24}
                height={24}
                className="h-5 w-5"
              />
            </button>
          </div>
        ),
      },
    ],
    [onOpenTradeJournal],
  );

  /* TanStack Table returns unstable function refs; React Compiler skips memoization. */
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data: trades,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageCount = Math.max(table.getPageCount(), 1);
  const pageIndex = table.getState().pagination.pageIndex;
  const displayPage = pageIndex + 1;

  if (!enabled) {
    return null;
  }

  return (
    <section
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-xl border border-border-secondary bg-kpi-card-bg",
        className,
      )}
    >
      <div className="min-w-0 overflow-x-auto">
        {dayQuery.isLoading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading trades…
          </div>
        ) : (
          <Table className="w-full min-w-0 table-auto border-separate border-spacing-0">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="h-16 border-0 border-b border-border-secondary bg-bg-tertiary hover:bg-bg-tertiary"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-6 text-xs font-semibold uppercase tracking-[0.04em] text-text-secondary",
                        header.column.id === "journal"
                          ? "w-[120px] min-w-[120px] text-right"
                          : "text-left",
                      )}
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
                    className="h-16 border-0 border-b border-border-secondary bg-kpi-card-bg hover:bg-kpi-card-bg"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-6 align-middle",
                          cell.column.id === "journal" &&
                            "w-[120px] min-w-[120px] text-right",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-kpi-card-bg">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 px-6 text-center text-sm text-text-tertiary"
                  >
                    No trades for this day.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {!dayQuery.isLoading && trades.length > 0 ? (
        <div className="flex h-16 items-center justify-end gap-1 border-t border-border-secondary bg-kpi-card-bg px-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-12 w-12 rounded-full text-sidebar-nav-active-text disabled:text-text-tertiary"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-12 w-12 rounded-full text-sidebar-nav-active-text disabled:text-text-tertiary"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="min-w-22 px-2 text-center text-xs font-semibold tracking-[0.04em] text-text-primary">
            Page {displayPage} of {pageCount}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-12 w-12 rounded-full text-sidebar-nav-active-text disabled:text-text-tertiary"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-12 w-12 rounded-full text-sidebar-nav-active-text disabled:text-text-tertiary"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </section>
  );
}
