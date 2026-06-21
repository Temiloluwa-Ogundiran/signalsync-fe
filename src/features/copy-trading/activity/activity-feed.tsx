import { Activity } from "lucide-react";
import type {
  CopyActivity,
  CopyTargetAccount,
  TelegramSource,
} from "../types";
import { groupActivity } from "../copy-trading-view-model";
import { EmptyState } from "../shared/empty-state";
import { ActivityItem } from "./activity-item";

export function ActivityFeed({
  events,
  sources,
  accounts,
  emptyTitle = "Waiting for the next signal",
}: {
  events: CopyActivity[];
  sources: TelegramSource[];
  accounts: CopyTargetAccount[];
  emptyTitle?: string;
}) {
  const groups = groupActivity(events);
  if (!groups.length) {
    return (
      <EmptyState
        compact
        icon={Activity}
        title={emptyTitle}
        body="New signal and broker outcomes will appear here automatically."
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border-primary bg-card-bg">
      {groups.map((group) => (
        <ActivityItem
          key={group.correlationId}
          group={group}
          sources={sources}
          accounts={accounts}
        />
      ))}
    </div>
  );
}
