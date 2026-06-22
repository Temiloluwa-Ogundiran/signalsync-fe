"use client";

import { AlertTriangle, Bot, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCopyTradingActions } from "../hooks";
import type { TelegramSource } from "../types";
import { apiError } from "../utils";

const confidenceGuidance = {
  high: "The pattern is consistent and easy to follow.",
  medium:
    "The pattern is usable, but occasional messages may need more context.",
  low: "The pattern changes often. Copying is available, but review activity closely.",
} as const;

export function ChannelAnalysisStep({
  source,
}: {
  source: TelegramSource;
}) {
  const actions = useCopyTradingActions();
  const analyzeAgain = async () => {
    try {
      await actions.relearnSource.mutateAsync(source.id);
      toast.info("Channel analysis started");
    } catch (error) {
      toast.error("Could not analyze this channel", {
        description: apiError(error),
      });
    }
  };

  if (source.state === "learning") {
    return (
      <div className="flex min-h-36 items-center justify-center gap-2 text-sm text-text-secondary">
        <Loader2 className="size-4 animate-spin" />
        Reviewing recent channel messages
      </div>
    );
  }

  if (
    source.state === "failed_retryable" ||
    (!source.profile &&
      source.state !== "unsupported" &&
      source.state !== "unsupported_image_primary")
  ) {
    return (
      <div className="flex gap-3 rounded-md border border-warning/25 bg-warning/5 px-4 py-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-text" />
        <div className="flex-1">
          <p className="font-medium text-text-primary">
            Analysis was interrupted
          </p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            No channel decision was made. Copy rules remain unchanged while you retry.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={analyzeAgain}
            disabled={actions.relearnSource.isPending}
          >
            <RefreshCw className="size-4" />
            Try analysis again
          </Button>
        </div>
      </div>
    );
  }

  if (
    source.state === "unsupported" ||
    source.state === "unsupported_image_primary"
  ) {
    return (
      <div className="flex gap-3 rounded-md border border-danger/25 bg-danger-light px-4 py-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
        <div>
          <p className="font-medium text-text-primary">
            This channel cannot be copied automatically
          </p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {source.unsupported_reason ??
              "This channel primarily sends image signals, which are not supported."}
          </p>
        </div>
      </div>
    );
  }

  const profile = source.profile!;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Bot className="size-4 text-text-secondary" />
        <p className="font-semibold text-text-primary">{source.title}</p>
        <Badge
          variant={
            profile.confidence === "high"
              ? "win"
              : profile.confidence === "medium"
                ? "warn"
                : "loss"
          }
        >
          {profile.confidence} confidence
        </Badge>
      </div>
      <p className="text-sm leading-6 text-text-secondary">
        {confidenceGuidance[profile.confidence]}
      </p>
      <dl className="grid gap-3 rounded-md border border-border-primary bg-bg-tertiary p-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalysisValue label="Signal style" value={profile.signal_style} />
        <AnalysisValue
          label="Message waiting time"
          value={`${profile.recommended_assembly_window_seconds} seconds`}
        />
        <AnalysisValue
          label="Messages reviewed"
          value={String(profile.sample_count)}
        />
        <AnalysisValue
          label="Image signals"
          value={`${Math.round(profile.image_frequency * 100)}%`}
        />
      </dl>
      {profile.supported_actions.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Actions found
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.supported_actions.map((action) => (
              <Badge key={action} variant="neutral">
                {action.replaceAll("_", " ")}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={analyzeAgain}
        disabled={actions.relearnSource.isPending}
      >
        <RefreshCw
          className={`size-4 ${actions.relearnSource.isPending ? "animate-spin" : ""}`}
        />
        Analyze again
      </Button>
    </div>
  );
}

function AnalysisValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-text-primary">{value}</dd>
    </div>
  );
}
