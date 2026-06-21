"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  CopyActivity,
  CopyTargetAccount,
  TelegramSource,
} from "../types";
import { accountLabel } from "../utils";
import { Select } from "../shared/form-controls";
import { ActivityFeed } from "./activity-feed";

export function CopyActivityPage({
  events,
  sources,
  accounts,
}: {
  events: CopyActivity[];
  sources: TelegramSource[];
  accounts: CopyTargetAccount[];
}) {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [accountId, setAccountId] = useState("");
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter(
      (event) =>
        (!term ||
          `${event.title} ${event.body ?? ""} ${JSON.stringify(event.parsed_details)}`
            .toLowerCase()
            .includes(term)) &&
        (!level || event.level === level) &&
        (!sourceId || event.source_id === sourceId) &&
        (!accountId || event.account_id === accountId),
    );
  }, [accountId, events, level, search, sourceId]);
  const hasFilters = Boolean(search || level || sourceId || accountId);
  const clear = () => {
    setSearch("");
    setLevel("");
    setSourceId("");
    setAccountId("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Copy Activity</h1>
        <p className="mt-1 text-sm text-text-secondary">
          A permanent history of signal decisions and broker outcomes.
        </p>
      </div>
      <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_180px_220px_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search symbols and outcomes"
            className="pl-9"
          />
        </div>
        <Select value={level} onChange={setLevel}>
          <option value="">All outcomes</option>
          <option value="success">Completed</option>
          <option value="warning">Needs attention</option>
          <option value="error">Failed</option>
          <option value="info">Processing</option>
        </Select>
        <Select value={sourceId} onChange={setSourceId}>
          <option value="">All signal channels</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.title}
            </option>
          ))}
        </Select>
        <Select value={accountId} onChange={setAccountId}>
          <option value="">All trading accounts</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {accountLabel(account, account.id)}
            </option>
          ))}
        </Select>
        <Button
          variant="ghost"
          onClick={clear}
          disabled={!hasFilters}
          aria-label="Clear activity filters"
        >
          <X className="size-4" />
          Clear
        </Button>
      </div>
      <ActivityFeed
        events={filtered}
        sources={sources}
        accounts={accounts}
        emptyTitle={
          hasFilters ? "No activity matches these filters" : "No copy activity yet"
        }
      />
    </div>
  );
}
