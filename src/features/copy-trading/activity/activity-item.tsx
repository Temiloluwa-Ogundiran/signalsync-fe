"use client";

import { AlertCircle, CheckCircle2, ChevronDown, CircleMinus, Clock3 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type {
  CopyTradingConnection,
  TelegramSource,
} from "../types";
import type { ActivityGroup } from "../copy-trading-view-model";
import {
  activityStatusState,
  failureGuidance,
  humanizeActivity,
} from "../copy-trading-view-model";
import { useCopyTradingActions } from "../hooks";
import { accountLabel, apiError, relativeTime } from "../utils";
import { StatusLabel } from "../shared/status-label";

export function ActivityItem({
  group,
  sources,
  accounts,
}: {
  group: ActivityGroup;
  sources: TelegramSource[];
  accounts: CopyTradingConnection[];
}) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState<string | null | undefined>();
  const actions = useCopyTradingActions();
  const event = group.latest;
  const presentation = humanizeActivity(event);
  const statusState = activityStatusState(event);
  const source = sources.find((item) => item.id === event.source_id);
  const account = accounts.find((item) => item.id === event.connection_id);
  const Icon =
    statusState === "failed" || statusState === "error"
      ? AlertCircle
      : statusState === "success"
        ? CheckCircle2
        : statusState === "skipped"
          ? CircleMinus
        : Clock3;

  const reveal = async () => {
    try {
      const result = await actions.revealRaw(event.id);
      setRaw(result.raw_message);
    } catch (error) {
      toast.error("Source message could not be loaded", {
        description: apiError(error),
      });
    }
  };

  return (
    <article className="border-b border-border-primary last:border-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-bg-tertiary/60"
      >
        <Icon
          className={`mt-0.5 size-4 shrink-0 ${
            statusState === "failed" || statusState === "error"
              ? "text-danger"
              : statusState === "success"
                ? "text-success"
                : "text-text-secondary"
          }`}
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-text-primary">
              {presentation.actionLabel}
            </span>
            <StatusLabel state={statusState} />
          </span>
          <span className="mt-1 block text-sm text-text-secondary">
            {presentation.statusLabel}
            {source ? ` · ${source.title}` : ""}
            {account ? ` · ${accountLabel(account, account.id)}` : ""}
          </span>
          {event.level === "error" ? (
            <span className="mt-2 block text-sm leading-6 text-danger">
              {failureGuidance(event)}
            </span>
          ) : null}
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-text-tertiary">
          {relativeTime(event.created_at)}
          <ChevronDown
            className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open ? (
        <div className="space-y-4 bg-bg-tertiary/40 px-4 py-4 pl-11">
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail title="Signal details" data={event.parsed_details} />
            <Detail title="Broker result" data={event.broker_details} />
          </div>
          {raw === undefined ? (
            <Button variant="outline" size="sm" onClick={reveal}>
              Reveal source message
            </Button>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase text-text-tertiary">
                Source message
              </p>
              <p className="mt-2 whitespace-pre-wrap rounded-md border border-border-primary bg-card-bg p-3 text-sm leading-6 text-text-secondary">
                {raw || "No source message is stored for this event."}
              </p>
            </div>
          )}
          <details className="text-xs text-text-tertiary">
            <summary className="cursor-pointer font-medium">
              Technical details
            </summary>
            <pre className="mt-2 overflow-x-auto rounded-md border border-border-primary bg-card-bg p-3">
              {JSON.stringify(
                {
                  correlation_id: group.correlationId,
                  event_ids: group.events.map((item) => item.id),
                },
                null,
                2,
              )}
            </pre>
          </details>
        </div>
      ) : null}
    </article>
  );
}

function Detail({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown>;
}) {
  const entries = Object.entries(data ?? {}).filter(
    ([, value]) => value !== null && value !== "",
  );
  if (!entries.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-text-tertiary">
        {title}
      </p>
      <dl className="mt-2 space-y-1.5 text-sm">
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-3">
            <dt className="capitalize text-text-secondary">
              {key.replaceAll("_", " ")}
            </dt>
            <dd className="max-w-[60%] break-words text-right font-medium text-text-primary">
              {Array.isArray(value)
                ? value.join(", ")
                : typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
