"use client";

import { useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { JournalOpenPosition } from "../types";

interface JournalOpenPositionsTableProps {
  rows: JournalOpenPosition[];
}

function formatPrice(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  });
}

function formatOpenedAt(value: string | null) {
  if (!value) return "Live";
  return new Date(value).toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function JournalOpenPositionsTable({
  rows,
}: JournalOpenPositionsTableProps) {
  const columns = useMemo<ColumnDef<JournalOpenPosition>[]>(
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
        accessorKey: "side",
        header: "Side",
        cell: ({ row }) => (
          <span className="text-sm font-semibold capitalize text-text-primary">
            {row.original.side}
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
        accessorKey: "current_price",
        header: "Current Price",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-text-primary">
            {formatPrice(row.original.current_price)}
          </span>
        ),
      },
      {
        accessorKey: "opened_at",
        header: "Open Time",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-text-primary">
            {formatOpenedAt(row.original.opened_at)}
          </span>
        ),
      },
      {
        accessorKey: "volume",
        header: "Lot Size",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-text-primary">
            {row.original.volume.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "floating_profit",
        header: "Floating P&L",
        cell: ({ row }) => (
          <span
            className={cn(
              "text-sm font-semibold",
              row.original.floating_profit >= 0
                ? "text-kpi-metric-positive"
                : "text-danger",
            )}
          >
            {row.original.floating_profit >= 0 ? "+" : ""}
            {row.original.floating_profit.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-border-secondary/70 bg-bg-secondary">
      <div className="overflow-x-auto">
        <Table className="min-w-[980px] border-separate border-spacing-0">
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
                  No open positions right now.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex min-h-[4.4rem] items-center justify-between gap-3 border-t border-border-secondary/80 bg-bg-secondary px-4 py-3">
        <p className="text-sm font-semibold text-text-primary">
          Showing {rows.length} open position{rows.length === 1 ? "" : "s"}
        </p>
      </div>
    </section>
  );
}
