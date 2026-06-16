"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { TradeAnnotation } from "../lib/journal-trade-tags";
import { strategyForTrade } from "../lib/journal-strategy";
import type { TagCategory, TagOption } from "../types";
import {
  useJournalTagsConfig,
  useTradeTags,
  useUpdateTradeTags,
} from "../hooks/use-journal-tags";
import { JournalTagSelector } from "./journal-tag-selector";
import { Badge } from "@/components/ui/badge";

export type TradeOutcome = "win" | "loss" | "be";

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
    <div className="overflow-hidden rounded-xl ring-1 ring-hairline">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-tertiary">
            <th className="px-4 py-2.5 text-left font-semibold">Time</th>
            <th className="px-4 py-2.5 text-left font-semibold">Symbol</th>
            <th className="px-4 py-2.5 text-left font-semibold">Dir</th>
            <th className="px-4 py-2.5 text-right font-semibold">Net P&amp;L</th>
            <th className="px-4 py-2.5 text-right font-semibold">Tags</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <TradeRow key={trade.id} trade={trade} accountId={accountId} />
          ))}
        </tbody>
      </table>
    </div>
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
  const strategy = strategyForTrade(trade.id);

  const goToTrades = () => router.push("/trade-history");

  // Real tags for this trade + the category to add into (first config category).
  const { data: config = [] } = useJournalTagsConfig();
  const { data: tradeTags = [] } = useTradeTags(trade.id, true);
  const updateTags = useUpdateTradeTags(accountId);
  const addCategory: TagCategory | undefined = config[0];

  const setTags = (optionIds: string[]) => {
    updateTags.mutate({ tradeId: trade.id, optionIds });
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
      className="cursor-pointer border-t border-hairline transition-colors hover:bg-surface-subtle-hover"
    >
      <td className="px-4 py-2.5 font-mono text-text-secondary tabular-nums">
        {trade.time}
      </td>
      <td className="px-4 py-2.5 font-bold text-text-primary">{trade.symbol}</td>
      <td className="px-4 py-2.5">
        <Badge variant="neutral">{trade.direction}</Badge>
      </td>
      <td
        className={cn(
          "px-4 py-2.5 text-right font-semibold tabular-nums",
          trade.outcome === "win" && "text-kpi-metric-positive",
          trade.outcome === "loss" && "text-danger",
          trade.outcome === "be" && "text-text-tertiary",
        )}
      >
        {money(trade.netProfit)}
      </td>
      <td className="px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {strategy ? <Badge variant="ai">{strategy}</Badge> : null}

          <div
            className="flex flex-wrap items-center justify-end gap-1.5"
            onClick={stop}
            role="presentation"
          >
            {tradeTags.map((tag: TagOption) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.65rem] font-semibold"
                style={{
                  backgroundColor: `${tag.color || "#64748b"}26`,
                  color: tag.color || "var(--text-tertiary)",
                }}
              >
                {tag.value}
              </span>
            ))}

            {addCategory ? (
              <JournalTagSelector
                category={addCategory}
                selectedOptions={tradeTags}
                onSelectChange={setTags}
                onOpenTagManager={() => {}}
                trigger={
                  <button
                    type="button"
                    title="Add tag"
                    className="inline-flex items-center gap-1 rounded border border-dashed border-hairline px-1.5 py-0.5 text-[0.65rem] font-semibold text-text-tertiary transition-colors hover:border-border-secondary hover:text-text-secondary"
                  >
                    <HugeiconsIcon icon={Add01Icon} size={11} strokeWidth={2.5} />
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
