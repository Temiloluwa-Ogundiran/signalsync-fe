import Link from "next/link";
import type {
  CopyActivity,
  CopyRoute,
  CopyTargetAccount,
  TelegramConnection,
  TelegramSource,
} from "../types";
import { ActivityFeed } from "../activity/activity-feed";
import { AttentionList } from "./attention-list";
import { HealthStrip } from "./health-strip";

export function MonitoringOverview({
  routes,
  connections,
  sources,
  accounts,
  activity,
}: {
  routes: CopyRoute[];
  connections: TelegramConnection[];
  sources: TelegramSource[];
  accounts: CopyTargetAccount[];
  activity: CopyActivity[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Copy Trading</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Live signal handling and broker outcomes across your copy rules.
        </p>
      </div>
      <HealthStrip
        routes={routes}
        connections={connections}
        accounts={accounts}
        activity={activity}
      />
      <AttentionList
        routes={routes}
        connections={connections}
        sources={sources}
        activity={activity}
      />
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Live activity
            </h2>
            <p className="mt-0.5 text-sm text-text-secondary">
              Signals are grouped from first message through broker result.
            </p>
          </div>
          <Link
            href="/copy-trading/activity"
            className="text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            View all activity
          </Link>
        </div>
        <ActivityFeed
          events={activity.slice(0, 12)}
          sources={sources}
          accounts={accounts}
        />
      </section>
    </div>
  );
}
