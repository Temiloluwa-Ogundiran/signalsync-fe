import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  active: "Active",
  ready: "Ready",
  paused: "Paused",
  learning: "Reviewing",
  pending: "Connecting",
  enabled: "Enabled",
  success: "Completed",
  reauthentication_required: "Reconnect",
  target_unavailable: "Account unavailable",
  unsupported: "Unsupported",
  failed: "Failed",
  error: "Failed",
  warning: "Needs attention",
  info: "Processing",
};

export function StatusLabel({ state }: { state: string }) {
  const variant =
    ["active", "ready", "enabled", "success"].includes(state)
      ? "win"
      : ["paused", "learning", "pending", "warning"].includes(state)
        ? "warn"
        : ["failed", "error", "unsupported", "target_unavailable"].includes(
              state,
            )
          ? "loss"
          : "neutral";
  return <Badge variant={variant}>{labels[state] ?? state.replaceAll("_", " ")}</Badge>;
}
