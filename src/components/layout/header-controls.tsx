"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { IconChevronDown } from "@/components/icons/syncgram-nav-icons";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Variant = "desktop" | "mobile";

interface DateRangePickerProps {
  variant: Variant;
  range: DateRange | undefined;
  rangeLabel: string;
  onApply: (range: DateRange | undefined) => void;
}

/** Shared date-range picker used by both the desktop and mobile header bars. */
export function HeaderDateRangePicker({
  variant,
  range,
  rangeLabel,
  onApply,
}: DateRangePickerProps) {
  const isDesktop = variant === "desktop";
  const hasRange = !!range?.from && !!range?.to;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center font-semibold text-sidebar-nav-active-text transition-colors hover:bg-sidebar-nav-active-bg hover:cursor-pointer border border-chrome-control-border",
            isDesktop
              ? "gap-2 rounded-l-lg px-4 py-2 text-sm"
              : "gap-1.5 rounded-lg px-3 py-1 text-xs min-w-0",
          )}
        >
          <Image
            src="/icons/navbar/calendar.svg"
            alt=""
            width={isDesktop ? 24 : 16}
            height={isDesktop ? 24 : 16}
            className="shrink-0"
          />
          <div className="flex flex-col items-start gap-0.5 leading-none min-w-0">
            <span
              className={cn(
                "select-none font-medium text-text-secondary",
                isDesktop ? "text-[10px]" : "text-[9px]",
              )}
            >
              Date range
            </span>
            <span
              className={cn(
                "font-semibold text-sidebar-nav-active-text truncate",
                isDesktop ? "text-[11px]" : "text-[10px]",
              )}
            >
              {hasRange ? rangeLabel : "Last 30 days"}
            </span>
          </div>
          <IconChevronDown className={isDesktop ? undefined : "h-3 w-3 shrink-0"} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-chrome-control-border bg-card-bg p-0"
        align="start"
      >
        <CalendarWidget
          mode="range"
          selected={range}
          onSelect={onApply}
          numberOfMonths={isDesktop ? 2 : 1}
          defaultMonth={range?.from}
        />
        {range?.from && (
          <div className="flex justify-end border-t border-chrome-control-border px-3 py-2">
            <button
              type="button"
              onClick={() => onApply(undefined)}
              className="rounded-md px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-sidebar-nav-active-bg hover:text-text-primary"
            >
              Clear range
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface AccountOption {
  id: string;
  display_name?: string | null;
  broker_login?: string | null;
}

interface AccountSelectorProps {
  variant: Variant;
  accounts: AccountOption[];
  activeAccountId: string;
  activeLabel: string;
  onSelect: (accountId: string) => void;
  onAddAccount: () => void;
}

/** Shared account selector used by both the desktop and mobile header bars. */
export function HeaderAccountSelector({
  variant,
  accounts,
  activeAccountId,
  activeLabel,
  onSelect,
  onAddAccount,
}: AccountSelectorProps) {
  const isDesktop = variant === "desktop";

  const AddAccountButton = (
    <button
      type="button"
      onClick={onAddAccount}
      className={cn(
        "flex w-full items-center justify-center gap-1.5 rounded-lg border border-chrome-control-border font-semibold text-text-primary hover:bg-sidebar-nav-active-bg cursor-pointer",
        isDesktop ? "mt-2 gap-2 px-3 py-2 text-sm" : "mt-1.5 px-2.5 py-1.5 text-xs",
      )}
    >
      <Plus className={isDesktop ? "h-4 w-4" : "h-3.5 w-3.5"} />
      Add account
    </button>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center font-semibold text-sidebar-nav-active-text transition-colors hover:bg-sidebar-nav-active-bg hover:cursor-pointer border border-chrome-control-border",
            isDesktop
              ? "gap-2 rounded-r-lg border-l-0 px-4 py-2 text-sm"
              : "gap-1.5 rounded-lg px-3 py-1.5 text-xs min-w-0",
          )}
        >
          <Image
            src="/icons/navbar/accounts.svg"
            alt=""
            width={isDesktop ? 24 : 16}
            height={isDesktop ? 24 : 16}
            className="shrink-0"
          />
          <span className="truncate">{activeLabel}</span>
          <IconChevronDown className={isDesktop ? undefined : "h-3 w-3 shrink-0"} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "border-chrome-control-border bg-card-bg p-2",
          isDesktop ? "w-72" : "w-64",
        )}
        align={isDesktop ? "end" : "start"}
      >
        {accounts.length ? (
          <>
            <div className={isDesktop ? "max-h-64 overflow-y-auto" : "max-h-48 overflow-y-auto"}>
              {accounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => onSelect(account.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg text-left text-text-primary hover:bg-sidebar-nav-active-bg",
                    isDesktop ? "px-3 py-2 text-sm" : "px-2.5 py-2 text-xs",
                  )}
                >
                  <span className="truncate pr-2">
                    {account.display_name || `Account ${account.broker_login}`}
                  </span>
                  {account.id === activeAccountId ? (
                    <span
                      className={cn(
                        "shrink-0 font-bold text-text-secondary",
                        isDesktop ? "text-xs" : "text-[10px]",
                      )}
                    >
                      Active
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            {AddAccountButton}
          </>
        ) : (
          AddAccountButton
        )}
      </PopoverContent>
    </Popover>
  );
}
