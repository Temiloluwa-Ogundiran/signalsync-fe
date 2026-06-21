"use client";

import { HelpCircle } from "lucide-react";
import { useId } from "react";

export function FieldHelp({ children }: { children: string }) {
  const tooltipId = useId();
  return (
    <span className="group/help relative inline-flex">
      <button
        type="button"
        aria-describedby={tooltipId}
        className="rounded text-text-tertiary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HelpCircle className="size-3.5" />
        <span className="sr-only">More information</span>
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-tooltip mb-2 w-64 -translate-x-1/2 rounded-md border border-border-primary bg-card-bg px-3 py-2 text-left text-xs leading-5 text-text-primary shadow-md group-hover/help:visible group-focus-within/help:visible"
      >
        {children}
      </span>
    </span>
  );
}
