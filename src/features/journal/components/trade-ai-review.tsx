"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  Alert02Icon,
  ArrowUpRight01Icon,
  Loading03Icon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useAiDockStore } from "@/features/ai/store/ai-dock-store";
import {
  useTradeReview,
  useRefreshTradeReview,
} from "@/features/ai/hooks/use-trade-review";
import type { JournalTrade } from "../types";

/**
 * "AI Review" tab of the trade detail panel. Shows a cached coach's review of
 * this one trade (via /ai/trade-review) and a "Continue with coach" button that
 * opens the AI dock in a trade-scoped session, seeded so the coach starts.
 */
export function TradeAiReview({
  trade,
  accountId,
  enabled,
}: {
  trade: JournalTrade;
  accountId: string;
  enabled: boolean;
}) {
  const openAi = useAiDockStore((s) => s.open);
  const {
    data: review,
    isLoading,
    isError,
  } = useTradeReview(trade.id, enabled);
  const refresh = useRefreshTradeReview();

  const onContinue = () =>
    openAi({
      source: `Trade · ${trade.symbol}`,
      accountId,
      contextType: "trade",
      contextRef: trade.id,
      seedMessage: `Review my ${trade.direction} trade on ${trade.symbol}. Was the entry, exit, and sizing sound, and what should I do differently next time?`,
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={AiMagicIcon}
            size={15}
            strokeWidth={2}
            className="text-ai-accent"
          />
          <span className="text-[0.7rem] font-semibold uppercase text-text-secondary">
            Coach&apos;s Read
          </span>
        </div>
        <button
          type="button"
          onClick={() => refresh.mutate(trade.id)}
          disabled={isLoading || refresh.isPending}
          aria-label="Regenerate review"
          title="Regenerate"
          className={cn(
            "rounded-md p-0.5 text-text-tertiary transition-colors hover:text-ai-accent cursor-pointer",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <HugeiconsIcon
            icon={Refresh01Icon}
            size={14}
            strokeWidth={2}
            className={refresh.isPending ? "animate-spin" : undefined}
          />
        </button>
      </div>

      {isLoading || refresh.isPending ? (
        <div className="flex items-center gap-2 py-1 text-sm text-text-secondary">
          <HugeiconsIcon
            icon={Loading03Icon}
            size={15}
            strokeWidth={2}
            className="animate-spin text-ai-accent"
          />
          Reviewing this trade…
        </div>
      ) : isError ? (
        <p className="text-sm leading-relaxed text-text-secondary">
          Couldn&apos;t generate the review.{" "}
          <button
            type="button"
            onClick={() => refresh.mutate(trade.id)}
            className="font-semibold text-ai-accent hover:underline"
          >
            Try again
          </button>
        </p>
      ) : (
        <p className="text-sm leading-relaxed text-text-primary">
          {review?.review}
        </p>
      )}

      {!isLoading && !refresh.isPending && !isError && review?.insight ? (
        <div className="flex items-start gap-2 rounded-lg border border-warning/25 bg-warning-light px-3 py-2.5">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={15}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-warning-text"
          />
          <p className="text-sm leading-relaxed text-warning-text">
            {review.insight}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onContinue}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
          "bg-ai-soft-bg text-ai-accent hover:bg-ai-soft-border cursor-pointer",
        )}
      >
        <HugeiconsIcon icon={AiMagicIcon} size={13} strokeWidth={2} />
        Continue with coach
        <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={2} />
      </button>
    </div>
  );
}
