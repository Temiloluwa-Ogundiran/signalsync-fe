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
  PAUSED: "Paused for the day",
  LOCKED: "Locked",
};

/**
 * The three-state traffic light the alarm surfaces. SAFE / CAUTION / DANGER —
 * derived from the engine's tier, not from numbers.
 */
export type GuardSignal = "SAFE" | "CAUTION" | "DANGER";

export function statusSignal(status: GuardStatus, breached: boolean): GuardSignal {
  if (breached) return "DANGER";
  switch (status) {
    case "HEALTHY":
      return "SAFE";
    case "CAUTION":
    case "PAUSED":
      return "CAUTION";
    case "WARNING":
    case "CRITICAL":
    case "LOCKED":
      return "DANGER";
  }
}

export const SIGNAL_WORD: Record<GuardSignal, string> = {
  SAFE: "SAFE",
  CAUTION: "CAUTION",
  DANGER: "DANGER",
};

/** Tailwind text-color class per signal. */
export function signalText(signal: GuardSignal): string {
  switch (signal) {
    case "SAFE":
      return "text-success";
    case "CAUTION":
      return "text-warning-text";
    case "DANGER":
      return "text-danger";
  }
}

/** Tailwind background tint per signal (soft fills, hero). */
export function signalTint(signal: GuardSignal): string {
  switch (signal) {
    case "SAFE":
      return "bg-success-light";
    case "CAUTION":
      return "bg-warning-light";
    case "DANGER":
      return "bg-danger-light";
  }
}

/** Dot color CSS var per signal. */
export function signalDot(signal: GuardSignal): string {
  switch (signal) {
    case "SAFE":
      return "var(--green)";
    case "CAUTION":
      return "var(--warning)";
    case "DANGER":
      return "var(--red)";
  }
}

/** Tailwind text-color class per status. */
export function statusText(status: GuardStatus): string {
  return signalText(statusSignal(status, false));
}

/** Tailwind background tint per status (soft fills, ribbons). */
export function statusTint(status: GuardStatus): string {
  return signalTint(statusSignal(status, false));
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
