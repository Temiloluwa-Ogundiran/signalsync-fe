import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  active: "Active",
  ready: "Ready",
  paused: "Paused",
  pending: "Connecting",
  enabled: "Enabled",
  success: "Completed",
  reauthentication_required: "Reconnect needed",
  target_unavailable: "Account unavailable",
  needs_attention: "Needs attention",
  failed: "Failed",
  error: "Failed",
  warning: "Needs attention",
  info: "Processing",
  processing: "Processing",
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
            "needs_attention", "processing",
          ].includes(state)
        ? "warn"
        : ["failed", "error", "target_unavailable"].includes(state)
          ? "loss"
          : "neutral";
  return <Badge variant={variant}>{labels[state] ?? state.replaceAll("_", " ")}</Badge>;
}
