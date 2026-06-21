import type { GuardStatus } from "../types";

/**
 * Status → presentation. The BE engine decides the tier; this maps it to the
 * app's semantic tokens. We never derive status from numbers here.
 */
export const STATUS_LABEL: Record<GuardStatus, string> = {
  HEALTHY: "Room to trade",
  CAUTION: "Tightening up",
  WARNING: "Close to the line",
  CRITICAL: "On the edge",
  LOCKED: "Locked",
};

/** Tailwind text-color class per status. */
export function statusText(status: GuardStatus): string {
  switch (status) {
    case "HEALTHY":
      return "text-success";
    case "CAUTION":
    case "WARNING":
      return "text-warning-text";
    case "CRITICAL":
    case "LOCKED":
      return "text-danger";
  }
}

/** Tailwind background tint per status (soft fills, ribbons). */
export function statusTint(status: GuardStatus): string {
  switch (status) {
    case "HEALTHY":
      return "bg-success-light";
    case "CAUTION":
    case "WARNING":
      return "bg-warning-light";
    case "CRITICAL":
    case "LOCKED":
      return "bg-danger-light";
  }
}

/** A meter fill color from the consumed ratio (0..100). Mirrors the engine tiers. */
export function meterColorFromConsumed(consumedPct: number): string {
  if (consumedPct >= 90) return "var(--red)";
  if (consumedPct >= 75) return "var(--warning)";
  if (consumedPct >= 50) return "var(--warning)";
  return "var(--green)";
}

export function formatMoney(n: number, sign = false): string {
  const abs = Math.abs(Math.round(n));
  const prefix = n < 0 ? "-" : sign ? "+" : "";
  return `${prefix}$${abs.toLocaleString("en-US")}`;
}

export function formatPct(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}
