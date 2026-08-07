import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  active: "Active",
  ready: "Ready",
  paused: "Paused",
  pending: "Connecting",
  enabled: "Enabled",
  success: "Completed",
  reauthentication_required: "Reconnect needed",
  disconnected: "Reconnecting",
  target_unavailable: "Account unavailable",
  needs_attention: "Needs attention",
  failed: "Failed",
  error: "Failed",
  warning: "Needs attention",
  info: "Processing",
  processing: "Processing",
  submitted: "Starting setup",
  provisioning: "Finding broker",
  deploying: "Starting terminal",
  connecting: "Connecting to broker",
  synchronizing: "Checking account",
  invalid_credentials: "Update sign-in details",
  server_not_found: "Check broker server",
  provisioning_failed: "Setup did not finish",
  broker_disconnected: "Broker disconnected",
  synchronization_failed: "Account check failed",
  trading_disabled: "Trading unavailable",
  deleting: "Disconnecting",
  deleted: "Disconnected",
  skipped: "No action",
};

export function StatusLabel({ state }: { state: string }) {
  const variant =
    ["active", "ready", "enabled", "success"].includes(state)
      ? "win"
      : [
            "paused",
            "pending",
            "warning",
            "needs_attention", "processing", "disconnected", "submitted",
            "provisioning", "deploying", "connecting", "synchronizing", "deleting",
          ].includes(state)
        ? "warn"
        : [
            "failed", "error", "target_unavailable", "invalid_credentials",
            "server_not_found", "provisioning_failed", "broker_disconnected",
            "synchronization_failed", "trading_disabled",
          ].includes(state)
          ? "loss"
          : "neutral";
  return <Badge variant={variant}>{labels[state] ?? state.replaceAll("_", " ")}</Badge>;
}
