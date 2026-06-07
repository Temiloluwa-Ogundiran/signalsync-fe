"use client";

import { PencilLine, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useJournalUiStore } from "../store/journal-ui-store";
import { Switch } from "@/components/ui/switch";

interface JournalTradeHistoryToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onOpenJournalDay: () => void;
  showManualToggle?: boolean;
}

export function JournalTradeHistoryToolbar({
  searchValue,
  onSearchChange,
  onOpenJournalDay,
  showManualToggle = true,
}: JournalTradeHistoryToolbarProps) {
  const openAddTradeModal = useJournalUiStore((s) => s.openAddTradeModal);
  const includeManualTrades = useJournalUiStore((s) => s.includeManualTrades);
  const setIncludeManualTrades = useJournalUiStore(
    (s) => s.setIncludeManualTrades,
  );

  return (
    <section className="flex flex-col gap-3 border-b border-border-secondary/80 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 lg:max-w-84">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by symbol or side"
            className="h-12 rounded-full border-0 bg-bg-secondary pl-11 pr-4 text-base text-text-primary placeholder:text-text-tertiary"
          />
        </div>
      </div>

      <div className="flex flex-row items-center gap-3 md:gap-4 flex-wrap md:flex-nowrap shrink-0">
        {/* Compact Analytics Toggle */}
        {showManualToggle ? (
          <div className="flex items-center gap-3 border border-border-primary/45 bg-bg-secondary rounded-full py-1.5 px-4 h-12 transition-all hover:border-border-primary select-none shrink-0">
            <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/15 text-accent text-[10px] font-bold">
                M
              </span>
              Manual trades
            </span>
            <Switch
              checked={includeManualTrades}
              onCheckedChange={setIncludeManualTrades}
              title={
                includeManualTrades
                  ? "Exclude manual trades from stats"
                  : "Include manual trades in stats"
              }
            />
          </div>
        ) : null}

        {/* Add Trade Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => openAddTradeModal(null)}
          className="h-12 rounded-full border-2 border-border-primary/60 bg-bg-secondary px-6 text-sm font-semibold text-text-primary hover:bg-bg-hover hover:border-border-primary cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Trade
        </Button>

        <Button
          type="button"
          onClick={onOpenJournalDay}
          className="h-12 rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-hover cursor-pointer shrink-0"
        >
          <PencilLine className="h-4 w-4" />
          Journal Day
        </Button>
      </div>
    </section>
  );
}
