import { useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PencilLine } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JournalDayTradeRow } from "./journal-day-modal.types";
import {
  asNumber,
  formatClock,
  formatCurrency,
} from "./journal-day-modal.utils";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface JournalDayModalTradesTableProps {
  rows: JournalDayTradeRow[];
  onOpenTradeJournal: (tradeId: string) => void;
}

export function JournalDayModalTradesTable({
  rows,
  onOpenTradeJournal,
}: JournalDayModalTradesTableProps) {
  const columnWidths = [
    "13.7%",
    "13.7%",
    "13.7%",
    "11%",
    "11%",
    "13.7%",
    "13.7%",
    "9.5%",
  ];

  const columns = useMemo<ColumnDef<JournalDayTradeRow>[]>(
    () => [
      {
        accessorKey: "opened_at",
        header: "Open Time",
        cell: ({ row }) => (
          <span className="text-text-primary font-heading font-medium">
            {formatClock(row.original.opened_at)}
          </span>
        ),
      },
      {
        accessorKey: "closed_at",
        header: "Close Time",
        cell: ({ row }) => (
          <span className="text-text-primary font-heading font-medium">
            {formatClock(row.original.closed_at)}
          </span>
        ),
      },
      {
        accessorKey: "symbol",
        header: "Instrument",
        cell: ({ row }) => (
          <span className="font-medium text-text-primary font-heading">
            {row.original.symbol}
          </span>
        ),
      },
      {
        accessorKey: "direction",
        header: "Side",
        cell: ({ row }) => (
          <span className="uppercase text-text-primary font-medium font-heading">
            {row.original.direction}
          </span>
        ),
      },
      {
        accessorKey: "volume",
        header: "Volume",
        cell: ({ row }) => (
          <span className="text-text-primary font-medium font-heading">
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
              className={`font-medium font-heading ${
                net >= 0 ? "text-kpi-metric-positive" : "text-danger"
              }`}
            >
              {formatCurrency(net)}
            </span>
          );
        },
      },
      {
        accessorKey: "net_roi_percent",
        header: "Net ROI",
        cell: ({ row }) => {
          const roi =
            row.original.net_roi_percent == null
              ? null
              : asNumber(row.original.net_roi_percent);
          return (
            <span className="font-medium text-text-primary font-heading">
              {roi == null ? "--" : `${roi.toFixed(2)}%`}
            </span>
          );
        },
      },
      {
        id: "note",
        header: () => <span className="text-center">Journal</span>,
        cell: ({ row }) => (
          <div className="text-left">
            <button
              onClick={() => onOpenTradeJournal(row.original.id)}
              className={`inline-flex cursor-pointer h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                row.original.journalMessageCount > 0
                  ? "border-accent/40 bg-accent-light text-accent"
                  : "border-border-primary text-text-tertiary hover:text-accent"
              }`}
              title="Open trade chat"
              aria-label="Open trade chat"
            >
              <Image
                src={"/icons/journal/modal/journal.svg"}
                alt=""
                width={20}
                height={20}
                className={cn("h-5 w-5")}
              />
            </button>
          </div>
        ),
      },
    ],
    [onOpenTradeJournal],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-6 min-h-0 overflow-hidden rounded-2xl">
      <div className="min-h-0 overflow-x-auto px-6 pb-6">
        {rows.length ? (
          <div className="min-h-0 min-w-[1080px]">
            <Table className="border-separate border-spacing-0">
              <colgroup>
                {columnWidths.map((width, index) => (
                  <col key={`header-col-${index}`} style={{ width }} />
                ))}
              </colgroup>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b-0 hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header, headerIndex) => (
                      <TableHead
                        key={header.id}
                        className={`bg-bg-tertiary px-6 py-6 text-base font-bold text-text-primary font-heading ${
                          headerIndex === 0 ? "rounded-l-2xl pl-6" : ""
                        } ${
                          headerIndex === headerGroup.headers.length - 1
                            ? "rounded-r-2xl pr-6"
                            : ""
                        }`}
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
            </Table>

            <div className="h-[36vh] min-h-0 overflow-y-auto overscroll-contain">
              <Table className="border-separate border-spacing-0">
                <colgroup>
                  {columnWidths.map((width, index) => (
                    <col key={`body-col-${index}`} style={{ width }} />
                  ))}
                </colgroup>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-border-primary/70 text-base"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-6 py-6">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-text-tertiary">
            No trades for this day.
          </p>
        )}
      </div>
    </div>
  );
}
