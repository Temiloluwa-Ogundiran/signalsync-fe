"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CopyDeadLetter } from "../types";
import { useCopyTradingActions } from "../hooks";
import { apiError, relativeTime } from "../utils";
import { ConfirmActionDialog } from "../shared/confirm-action-dialog";

function recoveryLabel(item: CopyDeadLetter) {
  if (item.event_type.includes("intent"))
    return "A broker instruction could not be delivered";
  if (item.event_type.includes("message"))
    return "A Telegram message could not be processed";
  if (item.source_stream.includes("signal"))
    return "A signal could not be interpreted";
  return "An automation step could not finish";
}

export function FailedEventRecovery({ items }: { items: CopyDeadLetter[] }) {
  const pending = items.filter((item) => item.state === "pending");
  const [selected, setSelected] = useState<CopyDeadLetter | null>(null);
  const actions = useCopyTradingActions();
  if (!pending.length) return null;
  return (
    <section
      className="overflow-hidden rounded-lg border border-warning-border bg-warning-bg"
      aria-labelledby="failed-events-title"
    >
      <div className="flex items-start gap-3 border-b border-warning-border px-4 py-4">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-warning-text"
        />
        <div>
          <h2
            id="failed-events-title"
            className="font-semibold text-text-primary"
          >
            Actions That Need Your Review
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            TradePartna stopped after 1 automatic retry. Review each item before
            trying it again.
          </p>
        </div>
      </div>
      <ul className="divide-y divide-warning-border">
        {pending.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-text-primary">
                {recoveryLabel(item)}
              </p>
              <p className="mt-1 break-words text-sm text-text-secondary">
                {item.error_message}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                Stopped {relativeTime(item.created_at)} after {item.attempts}{" "}
                attempt{item.attempts === 1 ? "" : "s"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(item)}
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Review & Retry
            </Button>
          </li>
        ))}
      </ul>
      <ConfirmActionDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Retry this action once?"
        description="Retry only if the connection or service problem is resolved. A broker instruction may place or change a trade if it did not reach the account before."
        confirmLabel="Retry Action"
        onConfirm={async () => {
          if (!selected) return;
          try {
            await actions.replayDeadLetter.mutateAsync(selected.id);
            toast.success("Action sent for 1 retry");
            setSelected(null);
          } catch (error) {
            toast.error("Action could not be retried", {
              description: apiError(error),
            });
          }
        }}
      />
    </section>
  );
}
