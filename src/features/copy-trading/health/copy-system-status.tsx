"use client";

import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type {
  CopyDeadLetter,
  CopyLaunchReadiness,
  CopySystemHealth,
} from "../types";
import { relativeTime } from "../utils";

const roleLabels: Record<string, string> = {
  "telegram-session": "Telegram listener",
  "copy-signal": "Signal processing",
  "copy-execution": "Broker execution",
  "copy-provisioning": "Account setup",
  metaapi: "MetaApi connection",
};

export function CopySystemStatus({
  health,
  launchReadiness,
  deadLetters,
}: {
  health?: CopySystemHealth;
  launchReadiness?: CopyLaunchReadiness;
  deadLetters: CopyDeadLetter[];
}) {
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
          <h2 className="font-semibold text-text-primary">
            Automation services
          </h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            Live status from the workers that read, interpret, and execute
            signals.
          </p>
        </div>
      </div>
      {launchReadiness && !launchReadiness.ready ? (
        <div className="border-b border-danger/30 bg-danger/5 px-4 py-3">
          <p className="text-sm font-semibold text-danger">
            Automation Needs Attention
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {launchReadiness.blockers.includes("uncertain_intents")
              ? "A broker confirmation is unresolved."
              : launchReadiness.blockers.includes("dead_letters")
                ? "A failed action needs review. Other healthy copy rules continue running."
                : "One or more automation services are not ready for new signals."}
          </p>
        </div>
      ) : null}
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
                  : component.status === "healthy"
                    ? "Connected"
                    : "Waiting for a response"}
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
                {pending.length} failed event{pending.length === 1 ? "" : "s"}{" "}
                available for recovery
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Replay only after the service issue has been resolved.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/copy-trading/activity">
                Review Failed Actions
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
