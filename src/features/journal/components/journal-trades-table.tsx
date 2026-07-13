"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { TradeAnnotation } from "../lib/journal-trade-tags";
import type { Tag } from "../types";
import {
  useJournalTagsConfig,
  useTradeTags,
  useUpdateTradeTags,
} from "../hooks/use-journal-tags";
import { JournalTagSelector } from "./journal-tag-selector";
import { Badge } from "@/components/ui/badge";

type TradeOutcome = "win" | "loss" | "be";

export interface TradeLineData {
  id: string;
  time: string; // "09:34"
  symbol: string;
  direction: "buy" | "sell";
  netProfit: number;
  outcome: TradeOutcome;
  annotation: TradeAnnotation;
}

/** "$108.88" / "-$42.10" — no leading +, color carries the sign. */
function money(value: number): string {
  const abs = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value < 0 ? `-$${abs}` : `$${abs}`;
}

/** Stop a click from bubbling to the row's navigation handler. */
function stop(e: React.MouseEvent) {
  e.stopPropagation();
}

/**
 * Minimal trades table for the expanded day card. One row per trade:
 * Time · Symbol · Dir · Net P&L · Tags. Outcome is conveyed by the Net P&L
 * color rather than a separate badge. Rows navigate to the trade history.
 */
export function JournalTradesTable({
  trades,
  accountId,
}: {
  trades: TradeLineData[];
  accountId: string;
}) {
  return (
    <table className="w-full table-fixed border-collapse text-sm">
      <thead>
        <tr className="border-b border-hairline text-[0.7rem] font-semibold uppercase text-text-tertiary [&>th]:whitespace-nowrap">
          <th className="w-[18%] py-2 pl-3 pr-4 text-left font-semibold">
            Time
          </th>
          <th className="w-[22%] py-2 pr-4 text-left font-semibold">Symbol</th>
          <th className="w-[18%] py-2 pr-4 text-left font-semibold">Dir</th>
          <th className="w-[20%] py-2 pr-4 text-left font-semibold">
            Net P&amp;L
          </th>
          <th className="w-[22%] py-2 pr-3 text-left font-semibold">Tags</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((trade) => (
          <TradeRow key={trade.id} trade={trade} accountId={accountId} />
        ))}
      </tbody>
    </table>
  );
}

function TradeRow({
  trade,
  accountId,
}: {
  trade: TradeLineData;
  accountId: string;
}) {
  const router = useRouter();

  const goToTrades = () => router.push("/trade-history");

  // Real tags for this trade + the full config of groups/tags to pick from.
  const { data: config = [] } = useJournalTagsConfig();
  const { data: tradeTags = [] } = useTradeTags(trade.id, true);
  const updateTags = useUpdateTradeTags(accountId);

  // Tags inherit their group's color; map group_id → color from config.
  const groupColor = new Map(config.map((g) => [g.id, g.color || "#64748b"]));

  const setTags = (tagIds: string[]) => {
    updateTags.mutate({ tradeId: trade.id, tagIds });
  };

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={goToTrades}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToTrades();
        }
      }}
      className="group cursor-pointer border-b border-hairline transition-colors last:border-b-0 hover:bg-surface-subtle-hover [&>td:first-child]:rounded-l-lg [&>td:first-child]:pl-3 [&>td:last-child]:rounded-r-lg [&>td:last-child]:pr-3"
    >
      <td className="py-2.5 pr-4 font-mono text-text-secondary tabular-nums">
        {trade.time}
      </td>
      <td className="py-2.5 pr-4 font-bold text-text-primary">
        {trade.symbol}
      </td>
      <td className="py-2.5 pr-4">
        <Badge variant="neutral">{trade.direction}</Badge>
      </td>
      <td
        className={cn(
          "py-2.5 pr-4 text-left font-semibold tabular-nums",
          trade.outcome === "win" && "text-kpi-metric-positive",
          trade.outcome === "loss" && "text-danger",
          trade.outcome === "be" && "text-text-tertiary",
        )}
      >
        {money(trade.netProfit)}
      </td>
      <td className="py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <div
            className="flex flex-wrap items-center gap-1.5"
            onClick={stop}
            role="presentation"
          >
            {tradeTags.map((tag: Tag) => {
              const c = groupColor.get(tag.group_id) || "#64748b";
              return (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.65rem] font-semibold"
                  style={{ backgroundColor: `${c}26`, color: c }}
                >
                  {tag.name}
                </span>
              );
            })}

            {config.length > 0 ? (
              <JournalTagSelector
                groups={config}
                selectedTags={tradeTags}
                onSelectChange={setTags}
                trigger={
                  <button
                    type="button"
                    title="Add tag"
                    className="inline-flex items-center gap-1 rounded border border-dashed border-hairline px-1.5 py-0.5 text-[0.65rem] font-semibold text-text-tertiary transition-colors hover:border-border-secondary hover:text-text-secondary"
                  >
                    <HugeiconsIcon
                      icon={Add01Icon}
                      size={11}
                      strokeWidth={2.5}
                    />
                    Tag
                  </button>
                }
              />
            ) : null}
          </div>
        </div>
      </td>
    </tr>
  );
}
