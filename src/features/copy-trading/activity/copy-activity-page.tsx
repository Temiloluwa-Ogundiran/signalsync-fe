"use client";

import { Search, X } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  CopyActivityFilters,
  CopyTradingConnection,
  TelegramSource,
  CopySignalReview,
} from "../types";
import { useCopyActivity } from "../hooks";
import { SectionError } from "../shared/section-error";
import { ActivityFeed } from "./activity-feed";
import { ActivityFiltersSheet, FilterSelects } from "./activity-filters-sheet";
import { SignalReviewList } from "./signal-review-list";

export function CopyActivityPage({
  sources,
  accounts,
  reviews,
}: {
  sources: TelegramSource[];
  accounts: CopyTradingConnection[];
  reviews: CopySignalReview[];
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<
    Omit<CopyActivityFilters, "cursor" | "limit">
  >({});
  const deferredSearch = useDeferredValue(search.trim());
  const query = useCopyActivity(
    { ...filters, search: deferredSearch || undefined },
    true,
  );
  const events = query.data?.pages.flatMap((page) => page.items) ?? [];
  const hasFilters = Boolean(
    search || filters.level || filters.source_id || filters.connection_id,
  );
  const clear = () => {
    setSearch("");
    setFilters({});
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-pretty text-2xl font-bold text-text-primary">
          Copy Activity
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          See what each signal did, what the broker returned, and what needs
          your attention.
        </p>
      </div>
      <SignalReviewList items={reviews} sources={sources} />
      <div className="flex gap-2 lg:grid lg:grid-cols-[minmax(220px,1fr)_180px_220px_220px_auto]">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
          />
          <Input
            aria-label="Search copy activity"
            name="copy-activity-search"
            autoComplete="off"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search symbols and outcomes..."
            className="pl-9"
          />
        </div>
        <div className="hidden lg:contents">
          <FilterSelects
            filters={filters}
            sources={sources}
            accounts={accounts}
            onChange={setFilters}
          />
        </div>
        <ActivityFiltersSheet
          filters={filters}
          sources={sources}
          accounts={accounts}
          onChange={setFilters}
          onClear={clear}
        />
        <Button
          variant="ghost"
          onClick={clear}
          disabled={!hasFilters}
          aria-label="Clear activity filters"
        >
          <X aria-hidden="true" className="size-4" />
          Clear
        </Button>
      </div>
      {query.isError ? (
        <SectionError
          title="Activity could not be loaded"
          description="Your copy rules are still running. Retry this history request."
          onRetry={() => query.refetch()}
        />
      ) : null}
      {query.isPending ? (
        <div
          className="rounded-lg border border-border-primary bg-card-bg px-4 py-12 text-center text-sm text-text-secondary"
          role="status"
          aria-live="polite"
        >
          Loading activity...
        </div>
      ) : (
        <ActivityFeed
          events={events}
          sources={sources}
          accounts={accounts}
          emptyTitle={
            hasFilters
              ? "No activity matches these filters"
              : "No copy activity yet"
          }
        />
      )}
      {query.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            disabled={query.isFetchingNextPage}
            onClick={() => query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? "Loading..." : "Load More Activity"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
