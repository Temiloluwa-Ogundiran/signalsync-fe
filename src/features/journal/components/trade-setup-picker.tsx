"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Plus, Loader2, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useSetups, useCreateSetup } from "../hooks/use-trade-detail";

interface TradeSetupPickerProps {
  /** Currently-assigned setup name (or null). */
  value: string | null;
  /** Assign a setup name, or null to clear. */
  onChange: (setup: string | null) => void;
}

/**
 * Single-select setup picker with inline create — pick an existing setup from
 * the user's flat list, or type a new name to create + assign it.
 */
export function TradeSetupPicker({ value, onChange }: TradeSetupPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: setups = [] } = useSetups();
  const createSetup = useCreateSetup();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? setups.filter((s) => s.name.toLowerCase().includes(q)) : setups;
  }, [setups, query]);

  const hasExactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return setups.some((s) => s.name.toLowerCase() === q);
  }, [setups, query]);

  const pick = (name: string) => {
    onChange(name);
    setQuery("");
    setOpen(false);
  };

  const createAndPick = async () => {
    const name = query.trim();
    if (!name) return;
    try {
      const created = await createSetup.mutateAsync(name);
      pick(created.name);
    } catch {
      // Surfaced by the mutation; keep the popover open to retry.
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border border-hairline bg-bg-primary px-3 py-2 text-left text-sm transition-colors hover:border-border-secondary focus:outline-none"
          >
            <span
              className={
                value ? "truncate text-text-primary" : "text-text-tertiary"
              }
            >
              {value || "No setup"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-text-tertiary" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 border-border-secondary bg-bg-secondary p-0 text-text-primary shadow-xl">
          <div className="border-b border-border-secondary p-2">
            <Input
              type="text"
              placeholder="Search or create setup…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pick(s.name)}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-bg-primary focus:outline-none"
              >
                <span className="truncate">{s.name}</span>
                {value === s.name && (
                  <Check className="h-3.5 w-3.5 text-brand" />
                )}
              </button>
            ))}

            {!hasExactMatch && query.trim() && (
              <button
                type="button"
                onClick={createAndPick}
                disabled={createSetup.isPending}
                className="mt-1 flex w-full items-center gap-2 rounded-md border border-dashed border-brand/20 px-2.5 py-1.5 text-left text-xs font-bold text-brand transition-colors hover:bg-brand/10 focus:outline-none disabled:opacity-60"
              >
                {createSetup.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                Create &quot;{query.trim()}&quot;
              </button>
            )}

            {filtered.length === 0 && hasExactMatch && (
              <p className="px-2.5 py-3 text-center text-xs text-text-tertiary">
                No setups yet
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {value ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Clear setup"
          className="shrink-0 rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
