"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type {
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
}: {
  health?: CopySystemHealth;
  launchReadiness?: CopyLaunchReadiness;
}) {
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
    </section>
  );
}
