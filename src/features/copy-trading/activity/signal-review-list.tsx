"use client";

import { MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CopySignalReview, TelegramSource } from "../types";
import { useCopyTradingActions } from "../hooks";
import { apiError } from "../utils";

export function SignalReviewList({ items, sources }: { items: CopySignalReview[]; sources: TelegramSource[] }) {
  const actions = useCopyTradingActions();
  if (!items.length) return null;

  const approve = async (review: CopySignalReview, conversationId: string) => {
    try {
      await actions.approveReview.mutateAsync({ id: review.id, conversationId });
      toast.success("Signal update sent for normal safety checks");
    } catch (error) {
      toast.error("Signal could not be approved", { description: apiError(error) });
    }
  };

  return (
    <section className="border-y border-border-primary py-4" aria-labelledby="signal-review-title">
      <div className="flex items-start gap-3">
        <MessageSquareWarning aria-hidden="true" className="mt-0.5 size-5 text-warning" />
        <div>
          <h2 id="signal-review-title" className="font-semibold text-text-primary">Choose which trade this update belongs to</h2>
          <p className="mt-1 text-sm text-text-secondary">Nothing is sent to the broker until you choose. Your route and account settings are still applied afterward.</p>
        </div>
      </div>
      <div className="mt-4 divide-y divide-border-primary border-t border-border-primary">
        {items.map((review) => (
          <div key={review.id} className="py-4">
            <p className="text-sm font-medium text-text-primary">
              {sources.find((source) => source.id === review.source_id)?.title ?? "Telegram source"}: {String(review.parsed_details.action ?? "trade update").replaceAll("_", " ")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {review.candidates.map((candidate) => (
                <Button key={candidate.conversation_id} size="sm" variant="outline" onClick={() => approve(review, candidate.conversation_id)}>
                  {candidate.direction?.toUpperCase() ?? "Trade"} {candidate.symbol ?? "signal"}
                </Button>
              ))}
              <Button size="sm" variant="ghost" onClick={() => actions.ignoreReview.mutate(review.id)}>Ignore update</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
