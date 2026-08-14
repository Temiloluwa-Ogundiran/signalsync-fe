"use client";

/**
 * Dual-month date-range picker with a preset rail.
 *
 * Usage:
 *   <DateRangePicker
 *     value={range}
 *     max={new Date()}                 // block future dates (optional)
 *     onChange={(r) => applyRange(r)}  // fires once, on the 2nd click / preset
 *   />
 *
 * Flow: click start → hover preview fills the span → click end → applies + closes.
 * Presets apply immediately. Emits date-only Dates at local midnight (the query
 * layer handles start/end-of-day + timezone).
 */

import { useState } from "react";
import { format } from "date-fns";
import type { DateRange as RdpRange } from "react-day-picker";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { ChevronDown } from "lucide-react";
import { DEFAULT_PRESETS, type DateRange, type Preset } from "./presets";
import { getCurrentMonthDateRange } from "@/lib/date-range";

export type { Preset } from "./presets";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  presets?: Preset[];
  /** Blocks dates after this (e.g. today, for analytics). */
  max?: Date;
  align?: "start" | "center" | "end";
  className?: string;
}

function sameDay(a?: Date, b?: Date) {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function DateRangePicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  max,
  align = "end",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(value?.from);
  // Local in-progress selection (cleared each open so the first click is start).
  const [draft, setDraft] = useState<RdpRange | undefined>(undefined);
  const [hovered, setHovered] = useState<Date | undefined>(undefined);

  // A date control is always meaningful on journal surfaces. Consumers may
  // omit a value during hydration, but the visible/default range remains this
  // month instead of falling back to an unbounded all-time query.
  const effectiveValue =
    value?.from && value.to
      ? { from: value.from, to: value.to }
      : getCurrentMonthDateRange();
  const hasRange = !!effectiveValue.from && !!effectiveValue.to;
  const triggerLabel = hasRange
    ? `${format(effectiveValue.from, "MMM d, yyyy")} – ${format(effectiveValue.to, "MMM d, yyyy")}`
    : "This month";

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft(undefined);
      setHovered(undefined);
      setMonth(effectiveValue.from ?? new Date());
    }
    setOpen(next);
  };

  // First click → {from}. Second click → {from,to}: apply + close.
  const handleSelect = (next: RdpRange | undefined) => {
    setHovered(undefined);
    if (next?.from && next.to) {
      setDraft(next);
      onChange?.({ from: next.from, to: next.to });
      setOpen(false);
      return;
    }
    setDraft(next);
  };

  const applyPreset = (preset: Preset) => {
    const r = preset.getRange();
    setMonth(r.from);
    onChange?.(r);
    setOpen(false);
  };

  // Highlight the span start → hovered day while only the start is picked.
  const preview =
    draft?.from && !draft.to && hovered
      ? hovered >= draft.from
        ? { from: draft.from, to: hovered }
        : { from: hovered, to: draft.from }
      : undefined;

  const activePresetId = presets.find(
    (p) =>
      hasRange &&
      sameDay(p.getRange().from, effectiveValue.from) &&
      sameDay(p.getRange().to, effectiveValue.to),
  )?.id;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-sidebar-nav-active-text transition-colors hover:cursor-pointer hover:bg-sidebar-nav-active-bg",
            className,
          )}
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            size={18}
            strokeWidth={1.5}
            className="shrink-0"
          />
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-auto border-chrome-control-border bg-card-bg p-0"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="min-w-0">
            <CalendarWidget
              mode="range"
              selected={draft}
              onSelect={handleSelect}
              numberOfMonths={2}
              month={month}
              onMonthChange={setMonth}
              captionLayout="dropdown"
              startMonth={new Date(2015, 0)}
              endMonth={new Date(2035, 11)}
              // min=2 → first click sets `from` only (no same-day collapse), so
              // the hover preview shows until the second click completes.
              min={2}
              disabled={max ? { after: max } : undefined}
              onDayMouseEnter={(day) => setHovered(day)}
              onDayMouseLeave={() => setHovered(undefined)}
              modifiers={preview ? { preview } : undefined}
              modifiersClassNames={{
                preview: "bg-ai-soft-bg text-sidebar-nav-active-text",
              }}
              classNames={{ button_previous: "hidden", button_next: "hidden" }}
            />
            <div className="flex items-center justify-between gap-3 border-t border-chrome-control-border px-3 py-2.5">
              <span className="truncate text-xs font-medium text-text-secondary">
                {draft?.from ? (
                  <>
                    <span className="text-text-primary">
                      {format(draft.from, "MMM d, yyyy")}
                    </span>
                    {" – select end date"}
                  </>
                ) : hasRange ? (
                  <span className="text-text-primary">{triggerLabel}</span>
                ) : (
                  "No date range selected"
                )}
              </span>
              {hasRange || draft?.from ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraft(undefined);
                    onChange?.(undefined);
                    setOpen(false);
                  }}
                  className="shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold text-text-secondary transition-colors hover:bg-sidebar-nav-active-bg hover:text-text-primary cursor-pointer"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          {/* Preset rail */}
          <div className="flex shrink-0 flex-col gap-0.5 border-t border-chrome-control-border p-2 sm:border-l sm:border-t-0 sm:py-3">
            {presets.map((preset) => {
              const isActive = preset.id === activePresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  aria-pressed={isActive}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-sidebar-nav-active-bg text-sidebar-nav-active-text"
                      : "text-text-secondary hover:bg-sidebar-nav-active-bg hover:text-text-primary",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
