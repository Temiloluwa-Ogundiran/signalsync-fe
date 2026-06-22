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
  unsupported_image_primary: "Image signals unsupported",
  failed_retryable: "Analysis interrupted",
  advisory: "Review advised",
  needs_attention: "Needs attention",
  failed: "Failed",
  error: "Failed",
  warning: "Needs attention",
  info: "Processing",
};

export function StatusLabel({ state }: { state: string }) {
  const variant =
    ["active", "ready", "enabled", "success"].includes(state)
      ? "win"
      : [
            "paused",
            "learning",
            "pending",
            "warning",
            "advisory",
            "failed_retryable",
            "needs_attention",
          ].includes(state)
        ? "warn"
        : [
              "failed",
              "error",
              "unsupported",
              "unsupported_image_primary",
              "target_unavailable",
            ].includes(state)
          ? "loss"
          : "neutral";
  return <Badge variant={variant}>{labels[state] ?? state.replaceAll("_", " ")}</Badge>;
}
