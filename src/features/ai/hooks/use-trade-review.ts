import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { aiApi } from "../api/ai.api";
import type { TradeReview } from "../types";

export const TRADE_REVIEW_KEYS = {
  all: ["ai-trade-review"] as const,
  trade: (tradeId: string) => ["ai-trade-review", tradeId] as const,
};

/**
 * Trade-level AI review. Fetches (and the backend caches) a short coach's
 * review of one trade. Only runs when `enabled` — the trade panel enables it
 * when the AI Review tab is opened so we don't generate reviews eagerly.
 */
export function useTradeReview(tradeId: string | undefined, enabled = true) {
  const { data: session, status } = useSession();
  return useQuery<TradeReview>({
    queryKey: TRADE_REVIEW_KEYS.trade(tradeId ?? ""),
    queryFn: () =>
      aiApi.getTradeReview(tradeId as string, undefined, session?.accessToken),
    enabled: status === "authenticated" && !!tradeId && enabled,
    staleTime: 5 * 60_000,
  });
}

/** Regenerate the review for a trade (refresh=true), then update the cache. */
export function useRefreshTradeReview() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation<TradeReview, Error, string>({
    mutationFn: (tradeId: string) =>
      aiApi.getTradeReview(tradeId, { refresh: true }, session?.accessToken),
    onSuccess: (data) => {
      queryClient.setQueryData(TRADE_REVIEW_KEYS.trade(data.trade_id), data);
    },
  });
}
