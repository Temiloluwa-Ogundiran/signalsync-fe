"use client";

import { toast } from "sonner";
import {
  useCopyAccountPolicies,
  useCopyActivity,
  useCopyDeadLetters,
  useCopyLaunchReadiness,
  useCopyRoutes,
  useCopySystemHealth,
  useCopyConnections,
  useCopyTradingSettings,
  useCopyTradingLiveUpdates,
  useCopyLatency,
  useCopySignalReviews,
  useTelegramConnections,
  useTelegramSources,
  useUpdateCopyTradingSettings,
} from "./hooks";
import {
  deriveCopyTradingMode,
  deriveSystemHealth,
} from "./copy-trading-view-model";
import { apiError } from "./utils";
import { CopyTradingShell } from "./copy-trading-shell";
import { SetupWorkspace } from "./setup/setup-workspace";
import { MonitoringOverview } from "./overview/monitoring-overview";
import { CopyRulesPage } from "./routes/copy-rules-page";
import { CopyActivityPage } from "./activity/copy-activity-page";
import { CopyTradingSettingsPage } from "./settings/copy-trading-settings-page";
import { SectionError } from "./shared/section-error";

export type CopyTradingView = "overview" | "routes" | "activity" | "settings";

export function CopyTradingPage({ view }: { view: CopyTradingView }) {
  useCopyTradingLiveUpdates(true);
  const settings = useCopyTradingSettings();
  const routes = useCopyRoutes();
  const policies = useCopyAccountPolicies();
  const activity = useCopyActivity(
    {},
    view === "overview" || view === "routes" || view === "activity",
  );
  const systemHealth = useCopySystemHealth(true);
  const launchReadiness = useCopyLaunchReadiness(true);
  const deadLetters = useCopyDeadLetters(
    view === "overview" || view === "activity",
  );
  const latency = useCopyLatency(view === "overview" || view === "activity");
  const reviews = useCopySignalReviews(view === "overview" || view === "activity");
  const accounts = useCopyConnections();
  const connections = useTelegramConnections();
  const sources = useTelegramSources();
  const updateSettings = useUpdateCopyTradingSettings();
  const settingsData = settings.data;
  const routesData = routes.data ?? [];
  const policiesData = policies.data ?? [];
  const activityData = activity.data?.pages.flatMap((page) => page.items) ?? [];
  const accountsData = accounts.data ?? [];
  const connectionsData = connections.data ?? [];
  const sourcesData = sources.data ?? [];
  const coreDataLoading =
    routes.isLoading ||
    policies.isLoading ||
    accounts.isLoading ||
    connections.isLoading ||
    sources.isLoading;
  const mode = deriveCopyTradingMode(routesData);
  const health = deriveSystemHealth({
    globallyPaused: settingsData?.is_paused ?? false,
    system: systemHealth.data,
    launch: launchReadiness.data,
    connections: connectionsData,
  });
  const firstError = [
    settings,
    routes,
    accounts,
    connections,
    sources,
    systemHealth,
    launchReadiness,
  ].find((query) => query.isError);

  const changePause = async (currentlyPaused: boolean) => {
    try {
      await updateSettings.mutateAsync(!currentlyPaused);
      toast.success(currentlyPaused ? "Copying resumed" : "Copying paused");
    } catch (error) {
      toast.error("Copying status could not be changed", {
        description: apiError(error),
      });
    }
  };

  let content;
  if (view === "settings" && coreDataLoading) {
    content = <CopySurfaceLoading label="Loading copy trading settings..." />;
  } else if (view === "settings") {
    content = (
      <CopyTradingSettingsPage
        connections={connectionsData}
        sources={sourcesData}
        accounts={accountsData}
        policies={policiesData}
      />
    );
  } else if (view === "routes") {
    content = (
      <CopyRulesPage
        routes={routesData}
        sources={sourcesData}
        accounts={accountsData}
        activity={activityData}
        loading={routes.isLoading || sources.isLoading || accounts.isLoading}
      />
    );
  } else if (view === "activity") {
    content = (
      <CopyActivityPage
        sources={sourcesData}
        accounts={accountsData}
        deadLetters={deadLetters.data ?? []}
        reviews={reviews.data ?? []}
      />
    );
  } else if (coreDataLoading) {
    content = <CopySurfaceLoading label="Loading copy trading..." />;
  } else if (mode === "setup") {
    content = (
      <SetupWorkspace
        connections={connectionsData}
        sources={sourcesData}
        accounts={accountsData}
        policies={policiesData}
        routes={routesData}
      />
    );
  } else {
    content = (
      <MonitoringOverview
        routes={routesData}
        connections={connectionsData}
        sources={sourcesData}
        accounts={accountsData}
        activity={activityData}
        systemHealth={systemHealth.data}
        launchReadiness={launchReadiness.data}
        deadLetters={deadLetters.data ?? []}
        latency={latency.data}
        reviews={reviews.data ?? []}
      />
    );
  }

  return (
    <CopyTradingShell
      health={health}
      isPaused={settingsData?.is_paused ?? false}
      isUpdating={updateSettings.isPending}
      accounts={accountsData}
      routes={routesData}
      sources={sourcesData}
      onPauseChange={changePause}
    >
      {firstError ? (
        <div className="mb-5">
          <SectionError
            title="Some copy-trading data could not be refreshed"
            description="Visible sections remain usable and automation continues on the server."
            onRetry={() => firstError.refetch()}
          />
        </div>
      ) : null}
      {content}
    </CopyTradingShell>
  );
}

function CopySurfaceLoading({ label }: { label: string }) {
  return (
    <div className="space-y-5" role="status" aria-live="polite">
      <p className="sr-only">{label}</p>
      <div className="h-16 animate-pulse rounded-md bg-bg-tertiary motion-reduce:animate-none" />
      <div className="h-52 animate-pulse rounded-lg border border-border-primary bg-card-bg motion-reduce:animate-none" />
      <div className="h-36 animate-pulse rounded-lg border border-border-primary bg-card-bg motion-reduce:animate-none" />
    </div>
  );
}
