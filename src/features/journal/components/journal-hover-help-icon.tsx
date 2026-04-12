"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CircleHelp } from "lucide-react";

import { cn } from "@/lib/utils";

export type JournalHoverHelpSide = "above" | "below";

export interface JournalHoverHelpIconProps {
  ariaLabel: string;
  tooltip: ReactNode;
  side?: JournalHoverHelpSide;
  icon?: LucideIcon;
  iconClassName?: string;
}

/**
 * Hover / keyboard-focus tooltip (CSS only, no popover).
 * Use `side="below"` when the trigger sits near the top of the viewport.
 */
export function JournalHoverHelpIcon({
  ariaLabel,
  tooltip,
  side = "above",
  icon: Icon = CircleHelp,
  iconClassName,
}: JournalHoverHelpIconProps) {
  const position =
    side === "above"
      ? "bottom-full left-1/2 mb-2 -translate-x-1/2"
      : "top-full left-1/2 mt-2 -translate-x-1/2";

  return (
    <span
      className="group relative z-50 inline-flex shrink-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-(--calendar-selected-ring)"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 cursor-help text-text-tertiary",
          iconClassName,
        )}
        aria-hidden
        strokeWidth={2}
      />
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none invisible absolute z-50 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-border-primary bg-bg-secondary px-3 py-2 text-left text-xs font-medium leading-snug text-text-primary shadow-md ring-1 ring-border-primary/40 group-hover:visible group-focus-visible:visible",
          position,
        )}
      >
        {tooltip}
      </span>
    </span>
  );
}
