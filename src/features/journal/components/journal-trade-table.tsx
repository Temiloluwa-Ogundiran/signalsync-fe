"use client";

import { Fragment, useMemo, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  type RowData,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Star,
  SlidersHorizontal,
  Loader2,
  Pencil,
  Trash2,
  Download,
  Copy,
  X,
  NotebookPen,
  Search,
  GripVertical,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { asNumber } from "./journal-day-modal.utils";
import type { TradeHistoryRow } from "./journal-trade-history.types";
import { useTradeTableStore } from "../store/trade-table-store";
import { useJournalUiStore } from "../store/journal-ui-store";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "right";
  }
}

interface JournalTradeTableProps {
  rows: TradeHistoryRow[];
  onOpenJournal: (row: TradeHistoryRow) => void;
  onDeleteManualTrade?: (tradeId: string) => void;
  /** Persist a trade's 1–5 star rating (0 clears it). */
  onRateTrade?: (tradeId: string, rating: number) => void;
  canLoadMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

/* ---------- formatting helpers ---------- */

const numFmt = (v: number, digits = 2) =>
  v.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const signedCurrency = (v: number) =>
  `${v < 0 ? "-" : ""}$${numFmt(Math.abs(v))}`;

const signedPercent = (v: number) => `${v < 0 ? "" : "+"}${numFmt(v)}%`;

function pnlClass(v: number) {
  if (v > 0) return "text-kpi-metric-positive";
  if (v < 0) return "text-danger";
  return "text-text-tertiary";
}

/* ---------- small presentational pieces ---------- */

/** 5-star rating: hover to preview, click to set (click the current value to clear). */
function StarRating({
  value,
  onRate,
}: {
  value: number;
  onRate?: (rating: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const readOnly = !onRate;

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHover(0)}
      role="radiogroup"
      aria-label="Trade rating"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= shown;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            aria-checked={n === value}
            role="radio"
            onMouseEnter={() => !readOnly && setHover(n)}
            onClick={() => onRate?.(n === value ? 0 : n)}
            className={cn(
              "transition-transform",
              !readOnly && "cursor-pointer hover:scale-110",
            )}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                filled
                  ? "fill-star text-star"
                  : "text-text-tertiary/40 hover:text-text-tertiary",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function DirectionPill({ direction }: { direction: "buy" | "sell" }) {
  const isLong = direction === "buy";
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5 text-xs font-semibold text-text-secondary">
      {isLong ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      {isLong ? "Long" : "Short"}
    </span>
  );
}

/**
 * TP/SL visual: a thin track with entry at center, TP and SL markers placed by
 * their distance from entry. Purely positional — no green/red on the chrome.
 */
function TpSlBar({ row }: { row: TradeHistoryRow }) {
  const entry = asNumber(row.open_price);
  const tp = row.tp != null ? asNumber(row.tp) : null;
  const sl = row.sl != null ? asNumber(row.sl) : null;
  if (!entry || (tp == null && sl == null)) {
    return <span className="text-xs text-text-tertiary">—</span>;
  }
  const span = Math.max(
    Math.abs((tp ?? entry) - entry),
    Math.abs((sl ?? entry) - entry),
    1e-9,
  );
  const pos = (price: number) => 50 + ((price - entry) / span) * 45;
  return (
    <div className="relative h-4 w-20" title={`TP ${tp ?? "—"} · SL ${sl ?? "—"}`}>
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-hairline" />
      <span className="absolute left-1/2 top-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2 bg-text-tertiary" />
      {tp != null ? (
        <span
          className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-kpi-metric-positive"
          style={{ left: `${pos(tp)}%` }}
        />
      ) : null}
      {sl != null ? (
        <span
          className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger"
          style={{ left: `${pos(sl)}%` }}
        />
      ) : null}
    </div>
  );
}

/* ---------- main table ---------- */

export function JournalTradeTable({
  rows,
  onOpenJournal,
  onDeleteManualTrade,
  onRateTrade,
  canLoadMore = false,
  isLoadingMore = false,
  onLoadMore,
}: JournalTradeTableProps) {
  const openEditTradeModal = useJournalUiStore((s) => s.openEditTradeModal);
  const favorites = useTradeTableStore((s) => s.favorites);
  const toggleFavorite = useTradeTableStore((s) => s.toggleFavorite);
  const columnVisibility = useTradeTableStore((s) => s.columnVisibility);
  const setColumnVisibility = useTradeTableStore((s) => s.setColumnVisibility);
  const columnOrder = useTradeTableStore((s) => s.columnOrder);
  const setColumnOrder = useTradeTableStore((s) => s.setColumnOrder);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "openedDateLabel", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [headerDragId, setHeaderDragId] = useState<string | null>(null);

  // Reorder a data column relative to another (used by header drag + menu).
  const reorderColumn = (from: string, to: string) => {
    if (
      from === to ||
      !MANAGEABLE_COLUMN_IDS.includes(from) ||
      !MANAGEABLE_COLUMN_IDS.includes(to)
    ) {
      return;
    }
    const base =
      columnOrder.length > 0
        ? columnOrder.filter((id) => MANAGEABLE_COLUMN_IDS.includes(id))
        : [...MANAGEABLE_COLUMN_IDS];
    const missing = MANAGEABLE_COLUMN_IDS.filter((id) => !base.includes(id));
    const next = [...base, ...missing];
    const fromIdx = next.indexOf(from);
    const toIdx = next.indexOf(to);
    if (fromIdx < 0 || toIdx < 0) return;
    next.splice(toIdx, 0, next.splice(fromIdx, 1)[0]);
    setColumnOrder(next);
  };

  const columns = useMemo<ColumnDef<TradeHistoryRow>[]>(
    () =>
      buildColumns({
        favorites,
        toggleFavorite,
        expanded,
        setExpanded,
        onRateTrade,
      }),
    [favorites, toggleFavorite, expanded, onRateTrade],
  );

  // Pinned utility columns always lead; user order applies to data columns only.
  const effectiveOrder = useMemo(() => {
    const dataOrder =
      columnOrder.length > 0
        ? columnOrder.filter((id) => MANAGEABLE_COLUMN_IDS.includes(id))
        : MANAGEABLE_COLUMN_IDS;
    const missing = MANAGEABLE_COLUMN_IDS.filter(
      (id) => !dataOrder.includes(id),
    );
    return [...PINNED_COLUMN_IDS, ...dataOrder, ...missing];
  }, [columnOrder]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnOrder: effectiveOrder },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: setRowSelection,
    getRowId: (r) => r.id,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  /* summary across loaded rows */
  const summary = useMemo(() => {
    const real = rows.filter((r) => !r.is_missed);
    const net = real.reduce((a, r) => a + asNumber(r.net_profit), 0);
    const wins = real.filter((r) => asNumber(r.net_profit) > 0).length;
    const winRate = real.length ? (wins / real.length) * 100 : 0;
    const avgRoi = real.length
      ? real.reduce((a, r) => a + asNumber(r.net_roi_percent ?? 0), 0) /
        real.length
      : 0;
    return { count: rows.length, net, winRate, avgRoi };
  }, [rows]);

  const exportCsv = (which: TradeHistoryRow[]) => {
    const header = [
      "Symbol",
      "Direction",
      "Open",
      "Close",
      "Volume",
      "Fees",
      "Net P&L",
      "Net ROI",
      "Opened",
      "Closed",
    ];
    const lines = which.map((r) =>
      [
        r.symbol,
        r.direction,
        asNumber(r.open_price),
        asNumber(r.close_price),
        r.volume,
        asNumber(r.commission),
        asNumber(r.net_profit),
        asNumber(r.net_roi_percent ?? 0),
        r.openedDateLabel,
        r.closedDateLabel,
      ].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trades.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-hairline bg-nav-sidebar-bg">
      {/* Summary strip + columns control */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <SummaryStat label="Trades" value={String(summary.count)} />
          <SummaryStat
            label="Net P&L"
            value={signedCurrency(summary.net)}
            className={pnlClass(summary.net)}
          />
          <SummaryStat label="Win rate" value={`${numFmt(summary.winRate, 1)}%`} />
          <SummaryStat
            label="Avg return"
            value={signedPercent(summary.avgRoi)}
            className={pnlClass(summary.avgRoi)}
          />
        </div>

        <ColumnsMenu
          table={table}
          order={
            columnOrder.length > 0
              ? columnOrder.filter((id) => MANAGEABLE_COLUMN_IDS.includes(id))
              : MANAGEABLE_COLUMN_IDS
          }
          setOrder={(next) => setColumnOrder(next)}
        />
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 ? (
        <div className="flex items-center gap-2 border-b border-hairline bg-ai-soft-bg px-4 py-2">
          <span className="text-sm font-semibold text-text-primary">
            {selectedCount} selected
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <BulkButton
              icon={Download}
              label="Export"
              onClick={() => exportCsv(selectedRows.map((r) => r.original))}
            />
            <BulkButton icon={Copy} label="Duplicate" onClick={() => {}} />
            <BulkButton
              icon={Trash2}
              label="Delete"
              destructive
              onClick={() => {
                selectedRows.forEach((r) => {
                  if (r.original.is_manual)
                    onDeleteManualTrade?.(r.original.id);
                });
                setRowSelection({});
              }}
            />
            <button
              type="button"
              onClick={() => setRowSelection({})}
              aria-label="Clear selection"
              className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const draggable = MANAGEABLE_COLUMN_IDS.includes(
                    header.column.id,
                  );
                  return (
                    <th
                      key={header.id}
                      draggable={draggable}
                      onDragStart={
                        draggable
                          ? () => setHeaderDragId(header.column.id)
                          : undefined
                      }
                      onDragOver={
                        draggable ? (e) => e.preventDefault() : undefined
                      }
                      onDrop={
                        draggable
                          ? () => {
                              if (headerDragId)
                                reorderColumn(headerDragId, header.column.id);
                              setHeaderDragId(null);
                            }
                          : undefined
                      }
                      onDragEnd={
                        draggable ? () => setHeaderDragId(null) : undefined
                      }
                      className={cn(
                        "sticky top-0 z-10 whitespace-nowrap border-b border-hairline bg-nav-sidebar-bg px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary",
                        header.column.columnDef.meta?.align === "right" &&
                          "text-right",
                        draggable && "cursor-grab active:cursor-grabbing",
                        headerDragId === header.column.id && "opacity-40",
                        headerDragId &&
                          headerDragId !== header.column.id &&
                          draggable &&
                          "hover:bg-surface-subtle",
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "inline-flex items-center gap-1 transition-colors hover:text-text-secondary cursor-pointer",
                            header.column.columnDef.meta?.align === "right" &&
                              "flex-row-reverse",
                          )}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-text-secondary" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="h-3 w-3 text-text-secondary" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const isOpen = expanded[row.id];
                return (
                  <Fragment key={row.id}>
                    <tr
                      className={cn(
                        "group/row transition-colors hover:bg-surface-subtle",
                        row.getIsSelected() && "bg-ai-soft-bg",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={cn(
                            "whitespace-nowrap border-b border-hairline px-3 py-2 text-text-primary",
                            cell.column.columnDef.meta?.align === "right" &&
                              "text-right tabular-nums",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                    {isOpen ? (
                      <tr>
                        <td
                          colSpan={row.getVisibleCells().length}
                          className="border-b border-hairline bg-surface-subtle px-6 py-4"
                        >
                          <ExpandedDetail
                            row={row.original}
                            onOpenJournal={onOpenJournal}
                            onEdit={
                              row.original.is_manual
                                ? () => openEditTradeModal(row.original.id)
                                : undefined
                            }
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-sm text-text-secondary"
                >
                  No trades match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex min-h-[3.25rem] items-center justify-between gap-3 border-t border-hairline px-4 py-3">
        <p className="text-[13px] text-text-tertiary">
          Showing {rows.length} loaded trade{rows.length === 1 ? "" : "s"}
        </p>
        {canLoadMore ? (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-1.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-subtle disabled:opacity-50 cursor-pointer"
          >
            {isLoadingMore ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Load more
          </button>
        ) : null}
      </div>
    </section>
  );
}

/* ---------- column definitions ---------- */

function buildColumns({
  favorites,
  toggleFavorite,
  expanded,
  setExpanded,
  onRateTrade,
}: {
  favorites: Record<string, true>;
  toggleFavorite: (id: string) => void;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onRateTrade?: (tradeId: string, rating: number) => void;
}): ColumnDef<TradeHistoryRow>[] {
  return [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <CheckBox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={(v) => table.toggleAllRowsSelected(v)}
          ariaLabel="Select all"
        />
      ),
      cell: ({ row }) => (
        <CheckBox
          checked={row.getIsSelected()}
          onChange={(v) => row.toggleSelected(v)}
          ariaLabel="Select row"
        />
      ),
    },
    {
      id: "favorite",
      enableSorting: false,
      header: () => <span className="sr-only">Favorite</span>,
      cell: ({ row }) => {
        const fav = !!favorites[row.original.id];
        return (
          <button
            type="button"
            onClick={() => toggleFavorite(row.original.id)}
            aria-label={fav ? "Unfavorite" : "Favorite"}
            className="flex size-6 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-subtle cursor-pointer"
          >
            <Star
              className={cn(
                "h-3.5 w-3.5",
                fav && "fill-ai-accent-bright text-ai-accent-bright",
              )}
            />
          </button>
        );
      },
    },
    {
      id: "expand",
      enableSorting: false,
      header: () => <span className="sr-only">Expand</span>,
      cell: ({ row }) => {
        const isOpen = expanded[row.id];
        return (
          <button
            type="button"
            onClick={() =>
              setExpanded((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
            }
            aria-label={isOpen ? "Collapse" : "Expand"}
            className="flex size-6 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary cursor-pointer"
          >
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        );
      },
    },
    {
      accessorKey: "symbol",
      header: "Instrument",
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5 font-semibold text-text-primary">
          {row.original.symbol}
          {row.original.is_missed ? (
            <span className="rounded bg-badge-warn-bg px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-badge-warn-fg">
              Missed
            </span>
          ) : row.original.is_manual ? (
            <span
              title="Manual trade"
              className="rounded bg-ai-accent/15 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ai-accent-bright"
            >
              M
            </span>
          ) : null}
        </span>
      ),
    },
    {
      accessorKey: "direction",
      header: "Direction",
      cell: ({ row }) => <DirectionPill direction={row.original.direction} />,
    },
    {
      accessorKey: "rating",
      header: "Rating",
      sortingFn: (a, b) =>
        (a.original.rating ?? 0) - (b.original.rating ?? 0),
      cell: ({ row }) => (
        <StarRating
          value={row.original.rating ?? 0}
          onRate={
            onRateTrade
              ? (rating) => onRateTrade(row.original.id, rating)
              : undefined
          }
        />
      ),
    },
    {
      accessorKey: "openedDateLabel",
      header: "Entry Date",
      sortingFn: (a, b) =>
        new Date(a.original.opened_at).getTime() -
        new Date(b.original.opened_at).getTime(),
      cell: ({ row }) => (
        <span className="text-text-secondary">{row.original.openedDateLabel}</span>
      ),
    },
    {
      accessorKey: "closedDateLabel",
      header: "Exit Date",
      sortingFn: (a, b) =>
        new Date(a.original.closed_at).getTime() -
        new Date(b.original.closed_at).getTime(),
      cell: ({ row }) => (
        <span className="text-text-secondary">
          {row.original.is_missed && !row.original.closed_at
            ? "—"
            : row.original.closedDateLabel}
        </span>
      ),
    },
    {
      accessorKey: "volume",
      header: "Qty",
      meta: { align: "right" },
      cell: ({ row }) =>
        row.original.is_missed ? "—" : numFmt(asNumber(row.original.volume)),
    },
    {
      accessorKey: "open_price",
      header: "Entry",
      meta: { align: "right" },
      cell: ({ row }) => numFmt(asNumber(row.original.open_price), 3),
    },
    {
      accessorKey: "close_price",
      header: "Exit",
      meta: { align: "right" },
      cell: ({ row }) =>
        row.original.is_missed && !row.original.close_price
          ? "—"
          : numFmt(asNumber(row.original.close_price), 3),
    },
    {
      id: "tpsl",
      header: "TP / SL",
      enableSorting: false,
      cell: ({ row }) => <TpSlBar row={row.original} />,
    },
    {
      accessorKey: "commission",
      header: "Fees",
      meta: { align: "right" },
      cell: ({ row }) => (
        <span className="text-text-secondary">
          {numFmt(asNumber(row.original.commission))}
        </span>
      ),
    },
    {
      accessorKey: "net_profit",
      header: "Net P&L",
      meta: { align: "right" },
      cell: ({ row }) => {
        if (row.original.is_missed)
          return <span className="text-text-tertiary">—</span>;
        const v = asNumber(row.original.net_profit);
        return (
          <span className={cn("font-semibold", pnlClass(v))}>
            {signedCurrency(v)}
          </span>
        );
      },
    },
    {
      accessorKey: "net_roi_percent",
      header: "Net ROI",
      meta: { align: "right" },
      cell: ({ row }) => {
        if (row.original.is_missed)
          return <span className="text-text-tertiary">—</span>;
        const v = asNumber(row.original.net_roi_percent ?? 0);
        return (
          <span className={cn("font-semibold", pnlClass(v))}>
            {signedPercent(v)}
          </span>
        );
      },
    },
  ];
}

/* ---------- subcomponents ---------- */

function SummaryStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
        {label}
      </span>
      <span className={cn("font-semibold tabular-nums text-text-primary", className)}>
        {value}
      </span>
    </span>
  );
}

function CheckBox({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex size-4 items-center justify-center rounded border transition-colors cursor-pointer",
        checked || indeterminate
          ? "border-ai-accent bg-ai-accent text-white"
          : "border-hairline hover:border-hairline",
      )}
    >
      {checked ? (
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
          <path
            d="M2.5 6.5L5 9L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : indeterminate ? (
        <span className="h-[1.5px] w-2 rounded bg-white" />
      ) : null}
    </button>
  );
}

function BulkButton({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: typeof Trash2;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
        destructive
          ? "text-danger hover:bg-danger/10"
          : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/** Leading utility columns — always pinned at the front, not reorderable. */
const PINNED_COLUMN_IDS = ["select", "favorite", "expand"];

const COLUMN_LABELS: Record<string, string> = {
  symbol: "Instrument",
  direction: "Direction",
  rating: "Rating",
  openedDateLabel: "Entry Date",
  closedDateLabel: "Exit Date",
  volume: "Qty",
  open_price: "Entry",
  close_price: "Exit",
  tpsl: "TP / SL",
  commission: "Fees",
  net_profit: "Net P&L",
  net_roi_percent: "Net ROI",
};

/** Data columns in their default order — the manageable/reorderable set. */
const MANAGEABLE_COLUMN_IDS = Object.keys(COLUMN_LABELS);

function ColumnsMenu({
  table,
  order,
  setOrder,
}: {
  table: ReturnType<typeof useReactTable<TradeHistoryRow>>;
  order: string[];
  setOrder: (next: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  // Manageable columns in the current persisted order (defaults if unset).
  const orderedIds = useMemo(() => {
    const base = order.length > 0 ? order : MANAGEABLE_COLUMN_IDS;
    const known = base.filter((id) => MANAGEABLE_COLUMN_IDS.includes(id));
    const missing = MANAGEABLE_COLUMN_IDS.filter((id) => !known.includes(id));
    return [...known, ...missing];
  }, [order]);

  const visibleList = orderedIds.filter((id) =>
    COLUMN_LABELS[id].toLowerCase().includes(search.trim().toLowerCase()),
  );

  const allVisible = orderedIds.every(
    (id) => table.getColumn(id)?.getIsVisible() ?? true,
  );

  const reorder = (from: string, to: string) => {
    if (from === to) return;
    const next = [...orderedIds];
    const fromIdx = next.indexOf(from);
    const toIdx = next.indexOf(to);
    if (fromIdx < 0 || toIdx < 0) return;
    next.splice(toIdx, 0, next.splice(fromIdx, 1)[0]);
    setOrder(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Columns
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-60 rounded-xl border border-hairline bg-popover p-0"
      >
        {/* Search + select-all header */}
        <div className="flex items-center gap-2 border-b border-hairline p-2">
          <CheckBox
            checked={allVisible}
            indeterminate={
              !allVisible &&
              orderedIds.some(
                (id) => table.getColumn(id)?.getIsVisible() ?? true,
              )
            }
            onChange={(v) => table.toggleAllColumnsVisible(v)}
            ariaLabel="Toggle all columns"
          />
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-md border border-hairline bg-transparent py-1 pl-7 pr-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-hairline"
            />
          </div>
        </div>

        {/* Scrollable, draggable list */}
        <div className="scrollbar-thin max-h-72 overflow-y-auto p-1.5">
          {visibleList.map((id) => {
            const col = table.getColumn(id);
            const visible = col?.getIsVisible() ?? true;
            return (
              <div
                key={id}
                draggable
                onDragStart={() => setDragId(id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) reorder(dragId, id);
                  setDragId(null);
                }}
                onDragEnd={() => setDragId(null)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-surface-subtle",
                  dragId === id && "opacity-40",
                )}
              >
                <span className="cursor-grab text-text-tertiary active:cursor-grabbing">
                  <GripVertical className="h-3.5 w-3.5" />
                </span>
                <CheckBox
                  checked={visible}
                  onChange={() => col?.toggleVisibility()}
                  ariaLabel={`Toggle ${COLUMN_LABELS[id]}`}
                />
                <button
                  type="button"
                  onClick={() => col?.toggleVisibility()}
                  className="flex-1 truncate text-left text-sm text-text-primary cursor-pointer"
                >
                  {COLUMN_LABELS[id]}
                </button>
              </div>
            );
          })}
          {visibleList.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-text-tertiary">
              No columns match.
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ExpandedDetail({
  row,
  onOpenJournal,
  onEdit,
}: {
  row: TradeHistoryRow;
  onOpenJournal: (row: TradeHistoryRow) => void;
  onEdit?: () => void;
}) {
  const facts: { label: string; value: string }[] = [
    { label: "Entry price", value: numFmt(asNumber(row.open_price), 3) },
    { label: "Exit price", value: numFmt(asNumber(row.close_price), 3) },
    { label: "Take profit", value: row.tp != null ? numFmt(asNumber(row.tp), 3) : "—" },
    { label: "Stop loss", value: row.sl != null ? numFmt(asNumber(row.sl), 3) : "—" },
    { label: "Volume", value: numFmt(asNumber(row.volume)) },
    { label: "Fees", value: `$${numFmt(asNumber(row.commission))}` },
    { label: "Swap", value: row.swap != null ? `$${numFmt(asNumber(row.swap))}` : "—" },
    {
      label: "Net P&L",
      value: signedCurrency(asNumber(row.net_profit)),
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="flex flex-col gap-0.5">
            <span className="text-[11px] uppercase tracking-wider text-text-tertiary">
              {f.label}
            </span>
            <span className="text-sm font-medium tabular-nums text-text-primary">
              {f.value}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenJournal(row)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-subtle-hover cursor-pointer"
        >
          <NotebookPen className="h-3.5 w-3.5" />
          Open journal
        </button>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-subtle-hover hover:text-text-primary cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        ) : null}
      </div>
    </div>
  );
}
