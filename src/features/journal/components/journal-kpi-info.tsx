"use client";

import { Info } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface JournalKpiInfoProps {
  title: string;
  description: string;
}

export function JournalKpiInfo({ title, description }: JournalKpiInfoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-footnote-online opacity-80 transition-opacity hover:opacity-100"
          aria-label={`${title} info`}
        >
          <Info className="size-4" strokeWidth={2} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="max-w-64 border-chrome-control-border bg-card-bg p-3"
      >
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{description}</p>
      </PopoverContent>
    </Popover>
  );
}
