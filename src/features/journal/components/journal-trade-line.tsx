"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  ArrowRight01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { TradeAnnotation } from "../lib/journal-trade-tags";
import { strategyForTrade } from "../lib/journal-discipline";
import type { TagCategory, TagOption } from "../types";
import {
  useJournalTagsConfig,
  useTradeTags,
  useUpdateTradeTags,
} from "../hooks/use-journal-tags";
import { JournalTagSelector } from "./journal-tag-selector";

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

const OUTCOME_LABEL: Record<TradeOutcome, string> = {
  win: "WIN",
  loss: "LOSS",
  be: "BE",
};

/** Stop a click from bubbling to the row's navigation handler. */
function stop(e: React.MouseEvent) {
  e.stopPropagation();
}

export function JournalTradeLine({
  trade,
  accountId,
  isFirst,
  isLast,
}: {
  trade: TradeLineData;
  accountId: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const router = useRouter();
  const { annotation } = trade;
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
    <div className="relative flex gap-4">
      {/* Timeline gutter: dot + connector segments, all centered on left-1/2. */}
      <div className="relative w-3 shrink-0">
        {!isFirst ? (
          <span
            aria-hidden
            className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-white/[0.06]"
          />
        ) : null}
        {!isLast ? (
          <span
            aria-hidden
            className="absolute left-1/2 top-5 -bottom-2.5 w-px -translate-x-1/2 bg-white/[0.06]"
          />
        ) : null}
        <span
          aria-hidden
          className={cn(
            "absolute left-1/2 top-5 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full",
            trade.outcome === "win" && "bg-success/60",
            trade.outcome === "loss" && "bg-danger/60",
            trade.outcome === "be" && "bg-text-tertiary/60",
          )}
        />
      </div>

      {/* Clickable row → trades page. Tag controls stop propagation. */}
      <div
        role="button"
        tabIndex={0}
        onClick={goToTrades}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToTrades();
          }
        }}
        className="group min-w-0 flex-1 cursor-pointer rounded-xl bg-bg-primary px-4 py-3 text-left ring-1 ring-white/[0.05] transition-colors hover:bg-card-bg-hover"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-text-secondary tabular-nums">
            {trade.time}
          </span>
          <span className="font-bold text-text-primary">{trade.symbol}</span>

          {/* Direction — neutral. */}
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-text-secondary">
            {trade.direction}
          </span>

          {/* Outcome — WIN / LOSS / BE. */}
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide",
              trade.outcome === "win" && "bg-success-light text-kpi-metric-positive",
              trade.outcome === "loss" && "bg-danger-light text-danger",
              trade.outcome === "be" && "bg-white/[0.06] text-text-secondary",
            )}
          >
            {OUTCOME_LABEL[trade.outcome]}
          </span>

          {/* Strategy (mock) + tags (real) + add control — pushed right. */}
          <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
            {strategy ? (
              <span className="rounded bg-[rgba(139,92,246,0.14)] px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-[#A78BFA]">
                {strategy}
              </span>
            ) : null}

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
                    color: tag.color || "#94a3b8",
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
                      className="inline-flex items-center gap-1 rounded border border-dashed border-white/[0.12] px-1.5 py-0.5 text-[0.65rem] font-semibold text-text-tertiary transition-colors hover:border-white/25 hover:text-text-secondary"
                    >
                      <HugeiconsIcon icon={Add01Icon} size={11} strokeWidth={2.5} />
                      Tag
                    </button>
                  }
                />
              ) : null}
            </div>
          </div>

          {/* Hover chevron hinting navigation to the trades page. */}
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={16}
            strokeWidth={2}
            className="shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>

        {annotation.note ? (
          <div className="mt-2 flex items-start gap-1.5">
            <HugeiconsIcon
              icon={trade.outcome === "loss" ? CancelCircleIcon : CheckmarkCircle02Icon}
              size={14}
              strokeWidth={2}
              className={cn(
                "mt-0.5 shrink-0",
                trade.outcome === "win" && "text-kpi-metric-positive",
                trade.outcome === "loss" && "text-danger",
                trade.outcome === "be" && "text-text-tertiary",
              )}
            />
            <p className="text-sm leading-relaxed text-text-secondary">
              {annotation.note}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
