import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Small status/label chip. Theme-adaptive via design tokens — never hardcode
 * colors at the call site. Covers the journal's outcome (win/loss/be), account
 * (info/warn), AI tag, and neutral chips.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-surface-subtle text-text-secondary",
        win: "bg-success-light text-kpi-metric-positive",
        loss: "bg-danger-light text-danger",
        be: "bg-surface-subtle text-text-secondary",
        warn: "bg-badge-warn-bg text-badge-warn-fg",
        info: "bg-badge-info-bg text-badge-info-fg",
        ai: "bg-ai-soft-bg text-ai-accent",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[0.65rem]",
        md: "px-2 py-0.5 text-xs",
      },
    },
    defaultVariants: { variant: "neutral", size: "sm" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { badgeVariants };
