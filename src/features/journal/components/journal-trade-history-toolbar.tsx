"use client";

import { Download, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface JournalTradeHistoryToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function JournalTradeHistoryToolbar({
  searchValue,
  onSearchChange,
}: JournalTradeHistoryToolbarProps) {
  return (
    <section className="flex flex-col gap-3 border-b border-border-secondary/80 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 lg:max-w-84">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search"
            className="h-12 rounded-full border-0 bg-bg-secondary pl-11 pr-4 text-base text-text-primary placeholder:text-text-tertiary"
          />
        </div>
        <Button
          variant="ghost"
          className="h-12 rounded-full bg-bg-secondary px-5 text-sm font-semibold text-text-primary hover:bg-bg-hover"
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          className="h-12 rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Journal Day
        </Button>
        {/* <Button
          type="button"
          variant="outline"
          className="h-12 rounded-full border-2 border-chrome-control-border bg-bg-secondary px-6 text-sm font-semibold text-text-primary hover:bg-bg-hover"
        >
          <Download className="h-4 w-4" />
          Export Stats
        </Button> */}
      </div>
    </section>
  );
}
