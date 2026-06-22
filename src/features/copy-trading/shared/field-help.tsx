"use client";

import { HelpCircle } from "lucide-react";
import { useId } from "react";
import { Tooltip } from "radix-ui";

export function FieldHelp({ children }: { children: string }) {
  const tooltipId = useId();
  return (
    <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            aria-describedby={tooltipId}
            className="inline-flex rounded text-text-tertiary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HelpCircle className="size-3.5" />
            <span className="sr-only">More information</span>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            id={tooltipId}
            role="tooltip"
            side="top"
            sideOffset={8}
            collisionPadding={12}
            className="z-tooltip max-w-64 rounded-md border border-border-primary bg-card-bg px-3 py-2 text-left text-xs leading-5 text-text-primary shadow-md"
          >
            {children}
            <Tooltip.Arrow className="fill-card-bg" />
          </Tooltip.Content>
        </Tooltip.Portal>
    </Tooltip.Root>
  );
}
