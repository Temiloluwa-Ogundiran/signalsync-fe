import { useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
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
  formatCurrency,
  formatTradeTimestamp,
} from "./journal-day-modal.utils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useJournalUiStore } from "../store/journal-ui-store";

interface JournalDayModalTradesTableProps {
  rows: JournalDayTradeRow[];
  onOpenTradeJournal: (tradeId: string) => void;
  onDeleteManualTrade?: (tradeId: string) => void;
}

export function JournalDayModalTradesTable({
  rows,
  onOpenTradeJournal,
  onDeleteManualTrade,
}: JournalDayModalTradesTableProps) {
  const openEditTradeModal = useJournalUiStore((s) => s.openEditTradeModal);
  const columnWidths = [
    "13.7%",
    "13.7%",
    "13.7%",
    "11%",
    "11%",
    "13.7%",
    "13.7%",
    "15%", // adjust width to give actions column a bit more space
  ];

  const columns = useMemo<ColumnDef<JournalDayTradeRow>[]>(
    () => [
      {
        accessorKey: "opened_at",
        header: "Open Time",
        cell: ({ row }) => (
          <span className="text-text-primary font-heading font-medium">
            {formatTradeTimestamp(row.original.opened_at)}
          </span>
        ),
      },
      {
        accessorKey: "closed_at",
        header: "Close Time",
        cell: ({ row }) => (
          <span className="text-text-primary font-heading font-medium">
            {row.original.is_missed && !row.original.closed_at ? "—" : formatTradeTimestamp(row.original.closed_at)}
          </span>
        ),
      },
      {
        accessorKey: "symbol",
        header: "Instrument",
        cell: ({ row }) => (
          <span className="font-semibold text-text-primary font-heading flex items-center gap-1.5">
            {row.original.symbol}
            {row.original.is_missed ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/15 text-orange-500 uppercase tracking-wide border border-orange-500/20">
                Missed
              </span>
            ) : row.original.is_manual ? (
              <sup className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-accent/15 text-accent text-[9px] font-bold animate-in zoom-in duration-200" title="Manual Trade">
                M
              </sup>
            ) : null}
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
            {row.original.is_missed ? "—" : asNumber(row.original.volume).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "net_profit",
        header: "Net P&L",
        cell: ({ row }) => {
          if (row.original.is_missed) {
            return <span className="font-medium font-heading text-text-tertiary">—</span>;
          }
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
          if (row.original.is_missed) {
            return <span className="font-medium font-heading text-text-tertiary">—</span>;
          }
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
          <div className="text-left flex items-center gap-2">
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

            {row.original.is_manual && (
              <>
                <button
                  type="button"
                  onClick={() => openEditTradeModal(row.original.id)}
                  title="Edit manual trade"
                  aria-label="Edit manual trade"
                  className="inline-flex cursor-pointer h-10 w-10 items-center justify-center rounded-full border border-border-primary text-text-secondary hover:text-text-primary transition-all hover:bg-bg-tertiary"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteManualTrade && onDeleteManualTrade(row.original.id)}
                  title="Delete manual trade"
                  aria-label="Delete manual trade"
                  className="inline-flex cursor-pointer h-10 w-10 items-center justify-center rounded-full border border-border-primary text-danger hover:text-white transition-all hover:bg-danger hover:border-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [onOpenTradeJournal, onDeleteManualTrade, openEditTradeModal],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-6 rounded-2xl pb-6">
      <div className="overflow-x-auto px-6">
        {rows.length ? (
          // One table; the header row sticks to the top of the modal's scroll
          // region so the whole body (overview + these rows) scrolls together.
          <div className="min-w-[1080px]">
            <Table className="border-separate border-spacing-0">
              <colgroup>
                {columnWidths.map((width, index) => (
                  <col key={`col-${index}`} style={{ width }} />
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
                        className={`sticky top-0 z-10 bg-bg-tertiary px-6 py-5 text-base font-bold text-text-primary font-heading ${
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
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-border-primary/70 text-base"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-6 py-5">
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
        ) : (
          <p className="py-10 text-center text-sm text-text-tertiary">
            No trades for this day.
          </p>
        )}
      </div>
    </div>
  );
}
