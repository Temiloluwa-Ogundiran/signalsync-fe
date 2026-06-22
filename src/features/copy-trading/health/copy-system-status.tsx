"use client";

import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CopyDeadLetter, CopySystemHealth } from "../types";
import { useCopyTradingActions } from "../hooks";
import { apiError, relativeTime } from "../utils";

const roleLabels: Record<string, string> = {
  "telegram-session": "Telegram listener",
  "copy-learning": "Channel learning",
  "copy-signal": "Signal analysis",
  "copy-execution": "Broker execution",
};

export function CopySystemStatus({
  health,
  deadLetters,
}: {
  health?: CopySystemHealth;
  deadLetters: CopyDeadLetter[];
}) {
  const actions = useCopyTradingActions();
  const pending = deadLetters.filter((item) => item.state === "pending");

  if (!health) return null;
  return (
    <section className="rounded-lg border border-border-primary bg-card-bg">
      <div className="flex items-start gap-3 border-b border-border-primary px-4 py-4">
        {health.ready ? (
          <CheckCircle2 className="mt-0.5 size-4 text-success" />
        ) : (
          <AlertTriangle className="mt-0.5 size-4 text-warning-text" />
        )}
        <div>
          <h2 className="font-semibold text-text-primary">Automation services</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            Live status from the workers that read, interpret, and execute signals.
          </p>
        </div>
      </div>
      <div className="grid divide-y divide-border-primary md:grid-cols-2 md:divide-y-0">
        {health.components.map((component) => (
          <div
            key={component.role}
            className="flex items-center justify-between gap-4 border-border-primary px-4 py-3 md:border-b md:odd:border-r"
          >
            <div>
              <p className="text-sm font-medium text-text-primary">
                {roleLabels[component.role] ?? component.role}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {component.heartbeat_at
                  ? `Last response ${relativeTime(component.heartbeat_at)}`
                  : "No response received"}
              </p>
            </div>
            <span
              className={
                component.status === "healthy"
                  ? "text-xs font-medium text-success"
                  : "text-xs font-medium text-warning-text"
              }
            >
              {component.status === "healthy" ? "Online" : component.status}
            </span>
          </div>
        ))}
      </div>
      {pending.length ? (
        <div className="border-t border-border-primary px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {pending.length} failed event{pending.length === 1 ? "" : "s"} available for recovery
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Replay only after the service issue has been resolved.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={actions.replayDeadLetter.isPending}
              onClick={async () => {
                try {
                  await actions.replayDeadLetter.mutateAsync(pending[0].id);
                  toast.success("Failed event sent for processing");
                } catch (error) {
                  toast.error("Failed event could not be replayed", {
                    description: apiError(error),
                  });
                }
              }}
            >
              <RotateCcw className="size-4" />
              Replay latest
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
