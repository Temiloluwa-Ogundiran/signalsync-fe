"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type {
  CopyActivityFilters,
  CopyTargetAccount,
  TelegramSource,
} from "../types";
import { accountLabel } from "../utils";
import { Select } from "../shared/form-controls";

export function ActivityFiltersSheet({
  filters,
  sources,
  accounts,
  onChange,
  onClear,
}: {
  filters: Omit<CopyActivityFilters, "cursor" | "limit">;
  sources: TelegramSource[];
  accounts: CopyTargetAccount[];
  onChange: (filters: Omit<CopyActivityFilters, "cursor" | "limit">) => void;
  onClear: () => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter activity</SheetTitle>
          <SheetDescription>
            Narrow the server history by outcome, channel, or account.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="space-y-4">
          <FilterSelects
            filters={filters}
            sources={sources}
            accounts={accounts}
            onChange={onChange}
          />
          <Button variant="outline" className="w-full" onClick={onClear}>
            Clear filters
          </Button>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export function FilterSelects({
  filters,
  sources,
  accounts,
  onChange,
}: {
  filters: Omit<CopyActivityFilters, "cursor" | "limit">;
  sources: TelegramSource[];
  accounts: CopyTargetAccount[];
  onChange: (filters: Omit<CopyActivityFilters, "cursor" | "limit">) => void;
}) {
  return (
    <>
      <Select
        value={filters.level ?? ""}
        onChange={(level) =>
          onChange({
            ...filters,
            level: (level || undefined) as CopyActivityFilters["level"],
          })
        }
      >
        <option value="">All outcomes</option>
        <option value="success">Completed</option>
        <option value="warning">Needs attention</option>
        <option value="error">Failed</option>
        <option value="info">Processing</option>
      </Select>
      <Select
        value={filters.source_id ?? ""}
        onChange={(sourceId) =>
          onChange({ ...filters, source_id: sourceId || undefined })
        }
      >
        <option value="">All signal channels</option>
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.title}
          </option>
        ))}
      </Select>
      <Select
        value={filters.account_id ?? ""}
        onChange={(accountId) =>
          onChange({ ...filters, account_id: accountId || undefined })
        }
      >
        <option value="">All trading accounts</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {accountLabel(account, account.id)}
          </option>
        ))}
      </Select>
    </>
  );
}
