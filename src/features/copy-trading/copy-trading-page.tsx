"use client";

import { toast } from "sonner";
import { AppLoader } from "@/components/app-loader";
import {
  useCopyAccountPolicies,
  useCopyActivity,
  useCopyRoutes,
  useCopyTargetAccounts,
  useCopyTradingSettings,
  useTelegramConnections,
  useTelegramSources,
  useUpdateCopyTradingSettings,
} from "./hooks";
import {
  deriveAutomationHealth,
  deriveCopyTradingMode,
} from "./copy-trading-view-model";
import { apiError } from "./utils";
import { CopyTradingShell } from "./copy-trading-shell";
import { SetupWorkspace } from "./setup/setup-workspace";
import { MonitoringOverview } from "./overview/monitoring-overview";
import { CopyRulesPage } from "./routes/copy-rules-page";
import { CopyActivityPage } from "./activity/copy-activity-page";
import { CopyTradingSettingsPage } from "./settings/copy-trading-settings-page";

export type CopyTradingView =
  | "overview"
  | "routes"
  | "activity"
  | "settings";

export function CopyTradingPage({ view }: { view: CopyTradingView }) {
  const settings = useCopyTradingSettings();
  const routes = useCopyRoutes();
  const policies = useCopyAccountPolicies();
  const activity = useCopyActivity();
  const accounts = useCopyTargetAccounts();
  const connections = useTelegramConnections();
  const sources = useTelegramSources();
  const updateSettings = useUpdateCopyTradingSettings();
  const queries = [
    settings,
    routes,
    policies,
    activity,
    accounts,
    connections,
    sources,
  ];

  if (queries.some((query) => query.isLoading)) return <AppLoader />;
  if (queries.some((query) => query.isError)) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-text-primary">
          Copy Trading could not be loaded
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Refresh the page. Your existing copy rules continue running on the
          server.
        </p>
      </div>
    );
  }

  const settingsData = settings.data!;
  const routesData = routes.data ?? [];
  const policiesData = policies.data ?? [];
  const activityData = activity.data ?? [];
  const accountsData = accounts.data ?? [];
  const connectionsData = connections.data ?? [];
  const sourcesData = sources.data ?? [];
  const mode = deriveCopyTradingMode(routesData);
  const health = deriveAutomationHealth({
    globallyPaused: settingsData.is_paused,
    routes: routesData,
    connections: connectionsData,
    sources: sourcesData,
  });

  const changePause = async (currentlyPaused: boolean) => {
    try {
      await updateSettings.mutateAsync(!currentlyPaused);
      toast.success(
        currentlyPaused ? "Copying resumed" : "Copying paused",
      );
    } catch (error) {
      toast.error("Copying status could not be changed", {
        description: apiError(error),
      });
    }
  };

  let content;
  if (view === "settings") {
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
      />
    );
  } else if (view === "activity") {
    content = (
      <CopyActivityPage
        events={activityData}
        sources={sourcesData}
        accounts={accountsData}
      />
    );
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
      />
    );
  }

  return (
    <CopyTradingShell
      health={health}
      isPaused={settingsData.is_paused}
      isUpdating={updateSettings.isPending}
      accounts={accountsData}
      routes={routesData}
      sources={sourcesData}
      onPauseChange={changePause}
    >
      {content}
    </CopyTradingShell>
  );
}
