"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Cable,
  Check,
  ChevronDown,
  CircleDot,
  Eye,
  Link2,
  Loader2,
  Pause,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Route,
  Save,
  Search,
  ShieldCheck,
  Smartphone,
  Trash2,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { AppLoader } from "@/components/app-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  useCopyAccountPolicies,
  useCopyActivity,
  useCopyRoutes,
  useCopyTargetAccounts,
  useCopyTradingActions,
  useCopyTradingSettings,
  useTelegramConnections,
  useTelegramDialogs,
  useTelegramSources,
  useUpdateCopyAccountPolicy,
  useUpdateCopyTradingSettings,
} from "./hooks";
import type {
  CopyAccountPolicy,
  CopyActivity as CopyActivityType,
  CopyRoute,
  CopyRouteInput,
  CopyTargetAccount,
  TelegramAuth,
  TelegramConnection,
  TelegramSource,
} from "./types";

export type CopyTradingView = "overview" | "routes" | "accounts" | "activity";

const viewMeta = {
  overview: ["Copy Trading", "Connect Telegram, learn signal channels and monitor automation"],
  routes: ["Copy Routes", "Control how each channel copies into each MT5 account"],
  accounts: ["Account Controls", "Set hard lot caps, pause accounts and run emergency actions"],
  activity: ["Copy Activity", "Follow every signal from detection to broker outcome"],
} as const;

export function CopyTradingPage({ view }: { view: CopyTradingView }) {
  const [connectOpen, setConnectOpen] = useState(false);
  const settings = useCopyTradingSettings();
  const routes = useCopyRoutes();
  const policies = useCopyAccountPolicies();
  const activity = useCopyActivity();
  const connections = useTelegramConnections();
  const sources = useTelegramSources();
  const updateSettings = useUpdateCopyTradingSettings();
  const [title, description] = viewMeta[view];

  if ([settings, routes, policies, connections, sources].some((query) => query.isLoading)) {
    return <AppLoader />;
  }

  const handleAutomation = async (enabled: boolean) => {
    try {
      await updateSettings.mutateAsync(!enabled);
      toast.success(enabled ? "Automatic copying resumed" : "Automatic copying paused");
    } catch (error) {
      toast.error("Could not update automatic copying", { description: apiError(error) });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <header className="flex flex-col gap-4 border-b border-border-primary pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setConnectOpen(true)}>
            <Plus className="size-4" />
            Connect Telegram
          </Button>
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2",
              settings.data?.is_paused
                ? "border-warning/30 bg-warning/5"
                : "border-success/25 bg-success/5",
            )}
          >
            <span className="text-sm font-medium text-text-primary">
              {settings.data?.is_paused ? "Automation paused" : "Automation ready"}
            </span>
            <Switch
              checked={!settings.data?.is_paused}
              onCheckedChange={handleAutomation}
              disabled={updateSettings.isPending}
              aria-label="Toggle copy trading automation"
            />
          </div>
        </div>
      </header>

      {settings.data?.is_paused && (
        <Notice
          icon={Pause}
          tone="warning"
          title="All automatic actions are paused"
          body="New entries, updates, closes and pending-order cancellations will wait until automation is resumed."
          className="mt-5"
        />
      )}

      {view === "overview" && (
        <Overview
          connections={connections.data ?? []}
          sources={sources.data ?? []}
          routes={routes.data ?? []}
          activity={activity.data ?? []}
          onConnect={() => setConnectOpen(true)}
        />
      )}
      {view === "routes" && (
        <RoutesPanel routes={routes.data ?? []} sources={sources.data ?? []} />
      )}
      {view === "accounts" && (
        <AccountControls
          policies={policies.data ?? []}
          routes={routes.data ?? []}
          sources={sources.data ?? []}
        />
      )}
      {view === "activity" && (
        <ActivityTimeline
          events={activity.data ?? []}
          routes={routes.data ?? []}
          sources={sources.data ?? []}
        />
      )}
      <TelegramWizard open={connectOpen} onOpenChange={setConnectOpen} />
    </div>
  );
}

function Overview({
  connections,
  sources,
  routes,
  activity,
  onConnect,
}: {
  connections: TelegramConnection[];
  sources: TelegramSource[];
  routes: CopyRoute[];
  activity: CopyActivityType[];
  onConnect: () => void;
}) {
  const readyConnections = connections.filter((item) => item.state === "ready").length;
  const learnedSources = sources.filter((item) => item.profile && item.state !== "unsupported").length;
  const activeRoutes = routes.filter((item) => item.state === "active").length;
  const setupSteps = [
    { label: "Telegram connected", complete: readyConnections > 0 },
    { label: "Channel learned", complete: learnedSources > 0 },
    { label: "Route activated", complete: activeRoutes > 0 },
  ];
  const nextStep = setupSteps.find((step) => !step.complete);

  return (
    <div className="space-y-6 pt-6">
      <section className="grid overflow-hidden rounded-lg border border-border-primary bg-card-bg lg:grid-cols-[1.4fr_1fr]">
        <div className="border-b border-border-primary p-5 lg:border-r lg:border-b-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <CircleDot className="size-4 text-primary" />
            Automation setup
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {setupSteps.map((step, index) => (
              <div key={step.label} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md border text-xs font-bold",
                    step.complete
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-border-primary bg-bg-tertiary text-text-tertiary",
                  )}
                >
                  {step.complete ? <Check className="size-4" /> : index + 1}
                </div>
                <span className={cn("text-sm", step.complete ? "text-text-primary" : "text-text-secondary")}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              {nextStep ? "Next step" : "System state"}
            </p>
            <p className="mt-1 font-semibold text-text-primary">
              {nextStep?.label ?? "Ready to copy signals"}
            </p>
          </div>
          {readyConnections === 0 ? (
            <Button size="sm" onClick={onConnect}>
              Connect
              <ArrowRight className="size-4" />
            </Button>
          ) : learnedSources === 0 ? (
            <Link href="#channel-learning" className="text-sm font-semibold text-primary">
              Add channel
            </Link>
          ) : (
            <Button asChild size="sm">
              <Link href="/copy-trading/routes">Manage routes</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric icon={Cable} label="Telegram accounts" value={readyConnections} />
        <Metric icon={Bot} label="Learned channels" value={learnedSources} />
        <Metric icon={Radio} label="Active routes" value={activeRoutes} />
        <Metric icon={Activity} label="Recent events" value={activity.length} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Connections connections={connections} onConnect={onConnect} />
        <Sources connections={connections} sources={sources} />
      </div>

      <section className="overflow-hidden rounded-lg border border-border-primary bg-card-bg">
        <div className="flex items-center justify-between border-b border-border-primary px-4 py-3">
          <div>
            <h2 className="font-semibold text-text-primary">Recent activity</h2>
            <p className="mt-0.5 text-xs text-text-secondary">Latest signal and broker outcomes</p>
          </div>
          <Link href="/copy-trading/activity" className="text-sm font-medium text-text-secondary hover:text-text-primary">
            View all
          </Link>
        </div>
        <ActivityTimeline events={activity.slice(0, 5)} routes={routes} sources={sources} embedded />
      </section>
    </div>
  );
}

function Connections({
  connections,
  onConnect,
}: {
  connections: TelegramConnection[];
  onConnect: () => void;
}) {
  const actions = useCopyTradingActions();

  const togglePause = async (item: TelegramConnection, enabled: boolean) => {
    try {
      await actions.pauseConnection.mutateAsync({ id: item.id, paused: !enabled });
      toast.success(enabled ? "Telegram connection resumed" : "Telegram connection paused");
    } catch (error) {
      toast.error("Could not update Telegram connection", { description: apiError(error) });
    }
  };

  const disconnect = async (item: TelegramConnection) => {
    if (!window.confirm(`Disconnect ${connectionName(item)}? Its channels and routes will no longer receive messages.`)) {
      return;
    }
    try {
      await actions.disconnect.mutateAsync(item.id);
      toast.success("Telegram disconnected");
    } catch (error) {
      toast.error("Could not disconnect Telegram", { description: apiError(error) });
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border-primary bg-card-bg">
      <div className="flex items-center justify-between border-b border-border-primary px-4 py-3">
        <div>
          <h2 className="font-semibold text-text-primary">Telegram connections</h2>
          <p className="mt-0.5 text-xs text-text-secondary">Read-only sessions used to receive channel messages</p>
        </div>
        <Button size="sm" variant="outline" onClick={onConnect}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>
      {connections.length ? (
        connections.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border-b border-border-primary px-4 py-4 last:border-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-bg-tertiary">
              {item.state === "reauthentication_required" ? (
                <WifiOff className="size-4 text-danger" />
              ) : (
                <Smartphone className="size-4 text-text-secondary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium text-text-primary">{connectionName(item)}</p>
                <StateLabel state={item.is_paused ? "paused" : item.state} />
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                {item.username ? `@${item.username}` : item.phone_hint || "Telegram user session"}
                {item.last_heartbeat_at ? ` · seen ${relativeTime(item.last_heartbeat_at)}` : ""}
              </p>
              {item.reauthentication_reason && (
                <p className="mt-1 text-xs text-danger">{item.reauthentication_reason}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Switch
                checked={!item.is_paused}
                onCheckedChange={(enabled) => togglePause(item, enabled)}
                disabled={item.state !== "ready" || actions.pauseConnection.isPending}
                aria-label={`Toggle ${connectionName(item)}`}
              />
              <Button variant="ghost" size="icon-sm" onClick={() => disconnect(item)} aria-label="Disconnect Telegram">
                <Trash2 className="size-4 text-danger" />
              </Button>
            </div>
          </div>
        ))
      ) : (
        <EmptyState
          icon={Cable}
          title="No Telegram account connected"
          body="Connect a read-only Telegram session to discover and learn signal channels."
          compact
          action={<Button size="sm" onClick={onConnect}>Connect Telegram</Button>}
        />
      )}
    </section>
  );
}

function Sources({
  connections,
  sources,
}: {
  connections: TelegramConnection[];
  sources: TelegramSource[];
}) {
  const [open, setOpen] = useState(false);
  const actions = useCopyTradingActions();

  const remove = async (source: TelegramSource) => {
    if (!window.confirm(`Remove ${source.title}? Existing routes must be removed first.`)) return;
    try {
      await actions.deleteSource.mutateAsync(source.id);
      toast.success("Channel removed");
    } catch (error) {
      toast.error("Could not remove channel", { description: apiError(error) });
    }
  };

  const togglePause = async (source: TelegramSource, enabled: boolean) => {
    try {
      await actions.pauseSource.mutateAsync({ id: source.id, paused: !enabled });
      toast.success(enabled ? "Channel resumed" : "Channel paused");
    } catch (error) {
      toast.error("Could not update channel", { description: apiError(error) });
    }
  };

  const relearn = async (source: TelegramSource) => {
    try {
      await actions.relearnSource.mutateAsync(source.id);
      toast.info("Analyzing channel", { description: "The latest message pattern is being checked." });
    } catch (error) {
      toast.error("Could not analyze channel", { description: apiError(error) });
    }
  };

  return (
    <section id="channel-learning" className="overflow-hidden rounded-lg border border-border-primary bg-card-bg">
      <div className="flex items-center justify-between border-b border-border-primary px-4 py-3">
        <div>
          <h2 className="font-semibold text-text-primary">Channel learning</h2>
          <p className="mt-0.5 text-xs text-text-secondary">Signal patterns are learned once and quickly revalidated</p>
        </div>
        <Button
          size="sm"
          onClick={() => setOpen(true)}
          disabled={!connections.some((item) => item.state === "ready" && !item.is_paused)}
        >
          <Plus className="size-4" />
          Add channel
        </Button>
      </div>
      {sources.length ? (
        <div className="divide-y divide-border-primary">
          {sources.map((source) => (
            <div key={source.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-bg-tertiary">
                  <Bot className="size-4 text-text-secondary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-text-primary">{source.title}</p>
                    <StateLabel state={source.is_paused ? "paused" : source.state} />
                    {source.profile && (
                      <Badge variant={confidenceVariant(source.profile.confidence)}>
                        {source.profile.confidence} confidence
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {source.source_type}
                    {source.username ? ` · @${source.username}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={!source.is_paused}
                    onCheckedChange={(enabled) => togglePause(source, enabled)}
                    disabled={source.state === "unsupported" || source.state === "learning"}
                    aria-label={`Toggle ${source.title}`}
                  />
                  <Button variant="ghost" size="icon-sm" onClick={() => relearn(source)} aria-label="Analyze channel again">
                    <RefreshCw className={cn("size-4", actions.relearnSource.isPending && "animate-spin")} />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => remove(source)} aria-label="Remove channel">
                    <Trash2 className="size-4 text-danger" />
                  </Button>
                </div>
              </div>
              {source.profile ? (
                <>
                  <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-border-primary pt-4 text-xs sm:grid-cols-4">
                    <ProfileValue label="Signal style" value={source.profile.signal_style} />
                    <ProfileValue label="Assembly window" value={`${source.profile.recommended_assembly_window_seconds}s`} />
                    <ProfileValue
                      label="Image signals"
                      value={source.profile.image_primary ? "Unsupported" : `${Math.round(source.profile.image_frequency * 100)}%`}
                    />
                    <ProfileValue label="Messages sampled" value={String(source.profile.sample_count)} />
                  </dl>
                  {source.profile.confidence === "low" && !source.profile.image_primary && (
                    <div className="mt-4 flex gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2.5 text-sm text-text-secondary">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                      <p>
                        This channel has an inconsistent signal pattern. Copying is still available,
                        but review activity closely while the parser learns from new messages.
                      </p>
                    </div>
                  )}
                </>
              ) : source.state === "learning" ? (
                <div className="mt-4 flex items-center gap-2 border-t border-border-primary pt-4 text-sm text-text-secondary">
                  <Loader2 className="size-4 animate-spin" />
                  Analyzing seven days of channel messages
                </div>
              ) : null}
              {source.unsupported_reason && (
                <p className="mt-3 text-sm text-danger">{source.unsupported_reason}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bot}
          title="No channels selected"
          body="Choose a channel or group and TradePartna will learn how it publishes signals."
          compact
        />
      )}
      <SourceWizard open={open} onOpenChange={setOpen} connections={connections} sources={sources} />
    </section>
  );
}

function SourceWizard({
  open,
  onOpenChange,
  connections,
  sources,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  connections: TelegramConnection[];
  sources: TelegramSource[];
}) {
  const ready = connections.filter((item) => item.state === "ready" && !item.is_paused);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const connectionId = selectedId || ready[0]?.id || "";
  const dialogs = useTelegramDialogs(connectionId);
  const actions = useCopyTradingActions();
  const existingChats = new Set(sources.map((item) => `${item.connection_id}:${item.telegram_chat_id}`));
  const filtered = (dialogs.data ?? []).filter((dialog) => {
    const term = search.trim().toLowerCase();
    return !term || dialog.title.toLowerCase().includes(term) || (dialog.username ?? "").toLowerCase().includes(term);
  });

  const add = async (chatId: number) => {
    const dialog = dialogs.data?.find((item) => item.chat_id === chatId);
    if (!dialog) return;
    try {
      await actions.createSource.mutateAsync({
        connection_id: connectionId,
        telegram_chat_id: dialog.chat_id,
        title: dialog.title,
        username: dialog.username,
        source_type: dialog.source_type,
      });
      toast.info("Analyzing channel", { description: "We are learning its recent signal pattern." });
      onOpenChange(false);
    } catch (error) {
      toast.error("Could not add this channel", { description: apiError(error) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border-primary px-6 py-5">
          <DialogTitle>Select a Telegram source</DialogTitle>
          <DialogDescription>Search channels and groups available to the connected Telegram account.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 overflow-y-auto px-6 pb-6">
          {ready.length > 1 && (
            <Field label="Telegram account">
              <Select value={connectionId} onChange={setSelectedId}>
                {ready.map((item) => (
                  <option key={item.id} value={item.id}>{connectionName(item)}</option>
                ))}
              </Select>
            </Field>
          )}
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
            <Input
              placeholder="Search channels and groups"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-[52vh] divide-y divide-border-primary overflow-y-auto rounded-lg border border-border-primary">
            {dialogs.isLoading ? (
              <div className="py-12"><AppLoader /></div>
            ) : filtered.length ? (
              filtered.map((dialog) => {
                const added = existingChats.has(`${connectionId}:${dialog.chat_id}`);
                return (
                  <button
                    key={dialog.chat_id}
                    onClick={() => add(dialog.chat_id)}
                    disabled={added || actions.createSource.isPending}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-bg-tertiary disabled:cursor-default disabled:opacity-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-text-primary">{dialog.title}</span>
                      <span className="text-xs capitalize text-text-secondary">
                        {dialog.source_type}
                        {dialog.is_admin ? " · admin" : ""}
                        {dialog.username ? ` · @${dialog.username}` : ""}
                      </span>
                    </span>
                    {added ? <Badge variant="neutral">Added</Badge> : <Plus className="size-4 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <p className="py-10 text-center text-sm text-text-secondary">No channels match your search.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RoutesPanel({ routes, sources }: { routes: CopyRoute[]; sources: TelegramSource[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CopyRoute | null>(null);
  const accounts = useCopyTargetAccounts();
  const actions = useCopyTradingActions();

  const changeState = async (route: CopyRoute) => {
    const action = route.state === "active" ? "pause" : route.state === "paused" ? "resume" : "activate";
    try {
      await actions.routeAction.mutateAsync({ id: route.id, action });
      toast.success(action === "pause" ? "Route paused" : action === "resume" ? "Route resumed" : "Automatic copying started");
    } catch (error) {
      toast.error("Could not update route", { description: apiError(error) });
    }
  };

  const remove = async (route: CopyRoute) => {
    if (!window.confirm("Delete this copy route? Its activity history will remain available.")) return;
    try {
      await actions.deleteRoute.mutateAsync(route.id);
      toast.success("Copy route deleted");
    } catch (error) {
      toast.error("Could not delete route", { description: apiError(error) });
    }
  };

  return (
    <div className="space-y-5 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          Each route has independent lot sizing, take-profit and management rules.
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          disabled={!sources.some((item) => item.state === "ready" || item.state === "active")}
        >
          <Plus className="size-4" />
          New route
        </Button>
      </div>
      {routes.length ? (
        <div className="overflow-hidden rounded-lg border border-border-primary bg-card-bg">
          <div className="hidden grid-cols-[1.25fr_1.25fr_.7fr_1fr_.75fr_auto] gap-4 border-b border-border-primary bg-bg-tertiary px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary lg:grid">
            <span>Source</span>
            <span>MT5 account</span>
            <span>Fixed lot</span>
            <span>Take profits</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-border-primary">
            {routes.map((route) => {
              const source = sources.find((item) => item.id === route.source_id);
              const account = accounts.data?.find((item) => item.id === route.target_account_id);
              return (
                <div
                  key={route.id}
                  className="grid gap-4 px-4 py-4 lg:grid-cols-[1.25fr_1.25fr_.7fr_1fr_.75fr_auto] lg:items-center"
                >
                  <RouteCell label="Source">
                    <p className="font-semibold text-text-primary">{source?.title || "Deleted channel"}</p>
                    <p className="mt-0.5 text-xs capitalize text-text-secondary">{source?.source_type || "source"}</p>
                  </RouteCell>
                  <RouteCell label="MT5 account">
                    <p className="font-medium text-text-primary">{accountLabel(account, route.target_account_id)}</p>
                    {account && <p className="mt-0.5 text-xs text-text-secondary">{account.broker_name} · {account.broker_login}</p>}
                  </RouteCell>
                  <RouteCell label="Fixed lot">
                    <p className="font-semibold tabular-nums text-text-primary">{route.fixed_lot}</p>
                  </RouteCell>
                  <RouteCell label="Take profits">
                    <p className="capitalize text-text-primary">{takeProfitLabel(route)}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{route.pending_orders_enabled ? "Pending enabled" : "Market only"}</p>
                  </RouteCell>
                  <RouteCell label="Status"><StateLabel state={route.state} /></RouteCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant={route.state === "active" ? "outline" : "default"}
                      onClick={() => changeState(route)}
                    >
                      {route.state === "active" ? <Pause className="size-4" /> : <Radio className="size-4" />}
                      {route.state === "active" ? "Pause" : route.state === "paused" ? "Resume" : "Start"}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(route);
                        setOpen(true);
                      }}
                      aria-label="Edit route"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => remove(route)}
                      disabled={route.state === "active"}
                      aria-label="Delete route"
                    >
                      <Trash2 className="size-4 text-danger" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Link2}
          title="No copy routes yet"
          body="Create a route after channel learning completes. You can send one channel to multiple MT5 accounts."
          action={
            <Button onClick={() => setOpen(true)} disabled={!sources.some((item) => ["ready", "active"].includes(item.state))}>
              <Plus className="size-4" />
              Create first route
            </Button>
          }
        />
      )}
      <RouteWizard
        key={`${editing?.id ?? "new"}-${open}`}
        open={open}
        onOpenChange={setOpen}
        sources={sources}
        route={editing}
      />
    </div>
  );
}

const defaultRoute: CopyRouteInput = {
  source_id: "",
  target_account_id: "",
  fixed_lot: "0.01",
  take_profit_mode: "all",
  lot_distribution: "split_total",
  pending_orders_enabled: true,
  minimum_fields: "direction_symbol_sl_tp",
  assembly_window_seconds: null,
  process_all_group_authors: false,
  notify_success: true,
  notify_failure: true,
  allow_sl_tp_updates: true,
  allow_break_even: true,
  allow_additional_tp: true,
  allow_partial_close: true,
  allow_full_close: true,
  allow_pending_cancel: true,
  unsafe_minimum_confirmed: false,
};

function RouteWizard({
  open,
  onOpenChange,
  sources,
  route,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  sources: TelegramSource[];
  route: CopyRoute | null;
}) {
  const accounts = useCopyTargetAccounts();
  const actions = useCopyTradingActions();
  const [form, setForm] = useState<CopyRouteInput>(() => route ? routeInput(route) : defaultRoute);
  const selected = sources.find((item) => item.id === form.source_id);
  const learnedWindow = selected?.profile?.recommended_assembly_window_seconds ?? 1;
  const unsafe = form.minimum_fields !== "direction_symbol_sl_tp";

  const set = <K extends keyof CopyRouteInput>(key: K, value: CopyRouteInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async () => {
    const payload = {
      ...form,
      assembly_window_seconds: Math.max(form.assembly_window_seconds ?? learnedWindow, learnedWindow),
      unsafe_minimum_confirmed: unsafe,
      lot_distribution: form.take_profit_mode === "all" ? form.lot_distribution : "fixed_each" as const,
    };
    try {
      if (route) {
        const { source_id: _source, target_account_id: _target, ...changes } = payload;
        void _source;
        void _target;
        await actions.updateRoute.mutateAsync({ id: route.id, payload: changes });
        toast.success("Route settings saved");
      } else {
        await actions.createRoute.mutateAsync(payload);
        toast.success("Copy route created");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(route ? "Could not save route" : "Could not create route", { description: apiError(error) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{route ? "Edit copy route" : "Configure automatic copying"}</DialogTitle>
          <DialogDescription>
            Fixed-lot execution with independent safety and trade-management permissions.
          </DialogDescription>
        </DialogHeader>

        <FormSection title="Route">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telegram source">
              <Select value={form.source_id} onChange={(value) => set("source_id", value)} disabled={Boolean(route)}>
                <option value="">Select channel</option>
                {sources.filter((item) => ["ready", "active"].includes(item.state)).map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="MT5 account">
              <Select value={form.target_account_id} onChange={(value) => set("target_account_id", value)} disabled={Boolean(route)}>
                <option value="">Select account</option>
                {accounts.data?.map((item) => (
                  <option key={item.id} value={item.id}>{accountLabel(item, item.id)}</option>
                ))}
              </Select>
            </Field>
            <Field label="Fixed lot">
              <Input type="number" min="0.0001" step="0.01" value={form.fixed_lot} onChange={(event) => set("fixed_lot", event.target.value)} />
            </Field>
            <Field label="Assembly window">
              <div className="relative">
                <Input
                  type="number"
                  min={learnedWindow}
                  max={600}
                  value={form.assembly_window_seconds ?? learnedWindow}
                  onChange={(event) => set("assembly_window_seconds", Number(event.target.value))}
                  className="pr-16"
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-text-tertiary">seconds</span>
              </div>
              <span className="text-xs text-text-tertiary">Learned safe minimum: {learnedWindow}s</span>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Execution">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Minimum fields before entry">
              <Select value={form.minimum_fields} onChange={(value) => set("minimum_fields", value)}>
                <option value="direction_symbol_sl_tp">Direction, symbol, SL and TP</option>
                <option value="direction_symbol_tp">Direction, symbol and TP</option>
                <option value="direction_symbol_sl">Direction, symbol and SL</option>
                <option value="direction_symbol_entry">Direction, symbol and entry</option>
                <option value="direction_symbol">Direction and symbol</option>
              </Select>
            </Field>
            <Field label="Take-profit placement">
              <Select value={form.take_profit_mode} onChange={(value) => set("take_profit_mode", value as CopyRouteInput["take_profit_mode"])}>
                <option value="all">Place every TP</option>
                <option value="lowest">Lowest TP only</option>
                <option value="highest">Highest TP only</option>
              </Select>
            </Field>
            {form.take_profit_mode === "all" && (
              <Field label="Lot across take profits">
                <Select value={form.lot_distribution} onChange={(value) => set("lot_distribution", value as CopyRouteInput["lot_distribution"])}>
                  <option value="split_total">Split total fixed lot</option>
                  <option value="fixed_each">Fixed lot on every trade</option>
                </Select>
              </Field>
            )}
          </div>
          {unsafe && (
            <Notice
              icon={AlertTriangle}
              tone="warning"
              title="Protective levels may arrive after entry"
              body="This route can execute before both stop loss and take profit are known. Saving confirms you accept this risk."
            />
          )}
        </FormSection>

        <FormSection title="Permissions">
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              ["pending_orders_enabled", "Place pending orders", "Send valid limits and stops directly to the broker"],
              ["process_all_group_authors", "Process all group authors", "Default is admins and channel-originated messages only"],
              ["allow_sl_tp_updates", "Update stop loss and TP", "Apply later protective-level instructions"],
              ["allow_break_even", "Apply break even", "Move stop loss to entry when instructed"],
              ["allow_additional_tp", "Open additional TP legs", "Create another position for a new take profit"],
              ["allow_partial_close", "Allow partial close", "Reduce matching copied positions"],
              ["allow_full_close", "Allow full close", "Close matching copied positions"],
              ["allow_pending_cancel", "Cancel pending orders", "Cancel matching broker pending orders"],
              ["notify_success", "Email successful actions", "Send parsed and executed trade details"],
              ["notify_failure", "Email failures", "Send immediate permanent-failure details"],
            ] as [keyof CopyRouteInput, string, string][]).map(([key, label, description]) => (
              <Toggle
                key={key}
                label={label}
                description={description}
                checked={Boolean(form[key])}
                onChange={(value) => set(key, value as never)}
              />
            ))}
          </div>
        </FormSection>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={submit}
            disabled={!form.source_id || !form.target_account_id || actions.createRoute.isPending || actions.updateRoute.isPending}
          >
            {(actions.createRoute.isPending || actions.updateRoute.isPending) && <Loader2 className="size-4 animate-spin" />}
            {route ? "Save route" : "Create route"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TelegramWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) {
  const actions = useCopyTradingActions();
  const [method, setMethod] = useState<"phone" | "qr">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState<TelegramAuth | null>(null);

  useEffect(() => {
    if (!auth || ["ready", "failed"].includes(auth.state)) return;
    const timer = window.setInterval(async () => {
      try {
        const next = await actions.getAuth(auth.auth_id);
        setAuth(next);
        if (next.state === "ready") {
          toast.success("Telegram connected");
          onOpenChange(false);
        }
        if (next.state === "failed") toast.error(next.message);
      } catch {
        window.clearInterval(timer);
      }
    }, 1200);
    return () => window.clearInterval(timer);
  }, [auth, actions, onOpenChange]);

  const start = async () => {
    try {
      setAuth(method === "phone" ? await actions.startPhone.mutateAsync(phone) : await actions.startQr.mutateAsync());
    } catch (error) {
      toast.error("Could not start Telegram sign-in", { description: apiError(error) });
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setAuth(null);
      setCode("");
      setPassword("");
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Telegram</DialogTitle>
          <DialogDescription>Use phone verification or scan a QR code from the Telegram mobile app.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-bg-tertiary p-1">
          <Button variant={method === "phone" ? "secondary" : "ghost"} onClick={() => setMethod("phone")}>Phone code</Button>
          <Button variant={method === "qr" ? "secondary" : "ghost"} onClick={() => setMethod("qr")}>QR code</Button>
        </div>
        {!auth && (
          <>
            {method === "phone" && (
              <Field label="Telegram phone number">
                <Input placeholder="+234..." value={phone} onChange={(event) => setPhone(event.target.value)} />
              </Field>
            )}
            <Button onClick={start} disabled={(method === "phone" && phone.length < 7) || actions.startPhone.isPending || actions.startQr.isPending}>
              {(actions.startPhone.isPending || actions.startQr.isPending) && <Loader2 className="size-4 animate-spin" />}
              Continue
            </Button>
          </>
        )}
        {auth && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-border-primary bg-bg-tertiary p-3 text-sm text-text-secondary">
              {!["code_required", "password_required", "failed"].includes(auth.state) && <Loader2 className="size-4 animate-spin" />}
              {auth.message}
            </div>
            {auth.state === "qr_required" && auth.qr_url && (
              <div className="flex justify-center rounded-lg bg-white p-5">
                <QRCodeSVG value={auth.qr_url} size={220} />
              </div>
            )}
            {auth.state === "code_required" && (
              <div className="flex gap-2">
                <Input placeholder="Telegram code" value={code} onChange={(event) => setCode(event.target.value)} />
                <Button onClick={async () => setAuth(await actions.submitCode(auth.auth_id, code))}>Verify</Button>
              </div>
            )}
            {auth.state === "password_required" && (
              <div className="flex gap-2">
                <Input type="password" placeholder="Two-step password" value={password} onChange={(event) => setPassword(event.target.value)} />
                <Button onClick={async () => setAuth(await actions.submitPassword(auth.auth_id, password))}>Verify</Button>
              </div>
            )}
          </div>
        )}
        <p className="text-xs leading-5 text-text-tertiary">
          TradePartna uses a read-only Telegram user session and never sends messages. Your two-step password is not stored.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function AccountControls({
  policies,
  routes,
  sources,
}: {
  policies: CopyAccountPolicy[];
  routes: CopyRoute[];
  sources: TelegramSource[];
}) {
  const accounts = useCopyTargetAccounts();
  if (accounts.isLoading) return <AppLoader />;

  return (
    <div className="space-y-6 pt-6">
      {accounts.data?.length ? (
        <section className="overflow-hidden rounded-lg border border-border-primary bg-card-bg">
          <div className="border-b border-border-primary px-4 py-3">
            <h2 className="font-semibold text-text-primary">MT5 account safeguards</h2>
            <p className="mt-0.5 text-xs text-text-secondary">A route can never submit more than its account maximum lot.</p>
          </div>
          {accounts.data.map((account) => (
            <AccountPolicyRow
              key={`${account.id}-${policies.find((item) => item.account_id === account.id)?.updated_at ?? "new"}`}
              account={account}
              policy={policies.find((item) => item.account_id === account.id)}
              routeCount={routes.filter((route) => route.target_account_id === account.id).length}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="Connect an MT5 account first"
          body="Account safety limits become available after MT5 verification succeeds."
        />
      )}
      <EmergencyControls accounts={accounts.data ?? []} routes={routes} sources={sources} />
    </div>
  );
}

function AccountPolicyRow({
  account,
  policy,
  routeCount,
}: {
  account: CopyTargetAccount;
  policy?: CopyAccountPolicy;
  routeCount: number;
}) {
  const [maxLot, setMaxLot] = useState(policy?.max_lot ?? "100.0000");
  const mutation = useUpdateCopyAccountPolicy();

  const save = async (payload: { max_lot?: string; is_paused?: boolean }) => {
    try {
      await mutation.mutateAsync({ accountId: account.id, payload });
      toast.success("Account controls updated");
    } catch (error) {
      toast.error("Could not update account controls", { description: apiError(error) });
    }
  };

  return (
    <div className="grid gap-4 border-b border-border-primary p-4 last:border-0 md:grid-cols-[1fr_180px_150px_auto] md:items-end">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-text-primary">{accountLabel(account, account.id)}</p>
          <StateLabel state={policy?.is_paused ? "paused" : "enabled"} />
        </div>
        <p className="mt-1 text-xs text-text-secondary">
          {account.broker_name} · {account.broker_login} · {routeCount} {routeCount === 1 ? "route" : "routes"}
        </p>
      </div>
      <Field label="Maximum lot">
        <Input type="number" min="0.0001" step="0.01" value={maxLot} onChange={(event) => setMaxLot(event.target.value)} />
      </Field>
      <Toggle
        label={policy?.is_paused ? "Paused" : "Enabled"}
        checked={!policy?.is_paused}
        onChange={(enabled) => save({ is_paused: !enabled })}
        compact
      />
      <Button variant="outline" onClick={() => save({ max_lot: maxLot })} disabled={mutation.isPending}>
        <Save className="size-4" />
        Save
      </Button>
    </div>
  );
}

function EmergencyControls({
  accounts,
  routes,
  sources,
}: {
  accounts: CopyTargetAccount[];
  routes: CopyRoute[];
  sources: TelegramSource[];
}) {
  const actions = useCopyTradingActions();
  const [confirmation, setConfirmation] = useState("");
  const [scope, setScope] = useState("global");
  const [scopeId, setScopeId] = useState("");

  const scopeOptions = scope === "account" ? accounts : scope === "source" ? sources : scope === "route" ? routes : [];
  const execute = async (action: string) => {
    try {
      await actions.emergency.mutateAsync({
        action,
        scope,
        scope_id: scope === "global" ? undefined : scopeId,
        confirmation,
      });
      toast.warning("Emergency action started", { description: "Broker results will appear in Copy Activity." });
      setConfirmation("");
    } catch (error) {
      toast.error("Emergency action could not start", { description: apiError(error) });
    }
  };

  const unlocked = confirmation === "EMERGENCY" && (scope === "global" || Boolean(scopeId));
  return (
    <section className="rounded-lg border border-danger/30 bg-card-bg">
      <div className="border-b border-danger/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-danger" />
          <h2 className="font-semibold text-text-primary">Emergency controls</h2>
        </div>
        <p className="mt-1 text-xs text-text-secondary">Affect copied trades only. Existing manual trades are never touched.</p>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[180px_1fr_220px]">
        <Field label="Scope">
          <Select value={scope} onChange={(value) => { setScope(value); setScopeId(""); }}>
            <option value="global">All copy trading</option>
            <option value="account">MT5 account</option>
            <option value="source">Telegram source</option>
            <option value="route">Copy route</option>
          </Select>
        </Field>
        {scope !== "global" && (
          <Field label={`Select ${scope}`}>
            <Select value={scopeId} onChange={setScopeId}>
              <option value="">Select {scope}</option>
              {scopeOptions.map((item) => (
                <option key={item.id} value={item.id}>{emergencyOptionLabel(item)}</option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Confirmation">
          <Input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Type EMERGENCY" />
        </Field>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border-primary px-4 py-3">
        <Button variant="outline" disabled={!unlocked} onClick={() => execute("close_positions")}>Close copied positions</Button>
        <Button variant="outline" disabled={!unlocked} onClick={() => execute("cancel_pending")}>Cancel pending orders</Button>
        <Button variant="destructive" disabled={!unlocked} onClick={() => execute("both")}>Close and cancel</Button>
      </div>
    </section>
  );
}

function ActivityTimeline({
  events,
  routes,
  sources,
  embedded = false,
}: {
  events: CopyActivityType[];
  routes: CopyRoute[];
  sources: TelegramSource[];
  embedded?: boolean;
}) {
  const actions = useCopyTradingActions();
  const [level, setLevel] = useState("all");
  const [sourceId, setSourceId] = useState("all");
  const [routeId, setRouteId] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [raw, setRaw] = useState<Record<string, string | null>>({});

  const filtered = useMemo(() => events.filter((event) => {
    const term = search.trim().toLowerCase();
    return (level === "all" || event.level === level)
      && (sourceId === "all" || event.source_id === sourceId)
      && (routeId === "all" || event.route_id === routeId)
      && (!term || `${event.title} ${event.body ?? ""} ${event.action} ${JSON.stringify(event.parsed_details)}`.toLowerCase().includes(term));
  }), [events, level, routeId, search, sourceId]);

  const revealRaw = async (eventId: string) => {
    try {
      const result = await actions.revealRaw(eventId);
      setRaw((current) => ({ ...current, [eventId]: result.raw_message }));
      if (!result.raw_message) toast.info("No raw message is stored for this event");
    } catch (error) {
      toast.error("Could not reveal message", { description: apiError(error) });
    }
  };

  if (!events.length) {
    return <EmptyState icon={Activity} title="No activity yet" body="Signals and broker actions will appear here." compact={embedded} />;
  }

  return (
    <div className={cn(!embedded && "mt-6 space-y-4")}>
      {!embedded && (
        <div className="grid gap-2 rounded-lg border border-border-primary bg-card-bg p-3 sm:grid-cols-2 xl:grid-cols-[1fr_170px_210px_210px]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search activity" className="pl-9" />
          </div>
          <Select value={level} onChange={setLevel}>
            <option value="all">All statuses</option>
            <option value="success">Successful</option>
            <option value="error">Failed</option>
            <option value="warning">Needs attention</option>
            <option value="info">Information</option>
          </Select>
          <Select value={sourceId} onChange={setSourceId}>
            <option value="all">All Telegram sources</option>
            {sources.map((source) => <option key={source.id} value={source.id}>{source.title}</option>)}
          </Select>
          <Select value={routeId} onChange={setRouteId}>
            <option value="all">All routes</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {sources.find((source) => source.id === route.source_id)?.title || "Route"} · {route.fixed_lot} lot
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className={cn("divide-y divide-border-primary", !embedded && "overflow-hidden rounded-lg border border-border-primary bg-card-bg")}>
        {filtered.length ? filtered.map((event) => {
          const isOpen = expanded === event.id;
          const source = sources.find((item) => item.id === event.source_id);
          return (
            <div key={event.id}>
              <button
                className="flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-bg-tertiary/50"
                onClick={() => setExpanded(isOpen ? null : event.id)}
              >
                <div className={cn("mt-1.5 size-2 shrink-0 rounded-full", activityTone(event.level))} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-text-primary">{event.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                        <span>{humanAction(event.action)}</span>
                        {source && <span>· {source.title}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <time className="text-xs text-text-tertiary">{relativeTime(event.created_at)}</time>
                      <ChevronDown className={cn("size-4 text-text-tertiary transition-transform", isOpen && "rotate-180")} />
                    </div>
                  </div>
                  {event.body && <p className="mt-2 text-sm text-text-secondary">{event.body}</p>}
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-border-primary bg-bg-tertiary/35 px-4 py-4 sm:pl-9">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <DetailBlock title="Parsed instruction" data={event.parsed_details} />
                    <DetailBlock title="Broker result" data={event.broker_details} />
                  </div>
                  {raw[event.id] && (
                    <div className="mt-4 rounded-md border border-border-primary bg-background p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Raw Telegram message</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{raw[event.id]}</p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="font-mono text-[11px] text-text-tertiary">{event.correlation_id}</p>
                    <Button size="sm" variant="outline" onClick={() => revealRaw(event.id)}>
                      <Eye className="size-4" />
                      Reveal source message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <p className="px-4 py-12 text-center text-sm text-text-secondary">No activity matches these filters.</p>
        )}
      </div>
    </div>
  );
}

function DetailBlock({ title, data }: { title: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data ?? {}).filter(([, value]) => value !== null && value !== "" && value !== undefined);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">{title}</p>
      {entries.length ? (
        <dl className="mt-2 divide-y divide-border-primary rounded-md border border-border-primary bg-background">
          {entries.slice(0, 8).map(([key, value]) => (
            <div key={key} className="flex items-start justify-between gap-4 px-3 py-2 text-xs">
              <dt className="capitalize text-text-tertiary">{key.replaceAll("_", " ")}</dt>
              <dd className="max-w-[65%] text-right text-text-primary">{formatDetail(value)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-2 text-sm text-text-secondary">No details recorded.</p>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Route; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-primary bg-card-bg p-4">
      <div className="flex size-9 items-center justify-center rounded-md bg-bg-tertiary text-text-secondary">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xl font-bold tabular-nums text-text-primary">{value}</p>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  );
}

function Notice({
  icon: Icon,
  tone,
  title,
  body,
  className,
}: {
  icon: typeof AlertTriangle;
  tone: "warning" | "danger";
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-start gap-3 rounded-lg border p-3",
      tone === "danger" ? "border-danger/30 bg-danger/5" : "border-warning/30 bg-warning/5",
      className,
    )}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", tone === "danger" ? "text-danger" : "text-warning")} />
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-text-secondary">{body}</p>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t border-border-primary pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </section>
  );
}

function RouteCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary lg:hidden">{label}</p>
      {children}
    </div>
  );
}

function ProfileValue({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-text-tertiary">{label}</dt><dd className="mt-0.5 font-medium capitalize text-text-primary">{value}</dd></div>;
}

function StateLabel({ state }: { state: string }) {
  const normalized = state.replaceAll("_", " ");
  const variant = ["active", "ready", "enabled"].includes(state)
    ? "win"
    : ["unsupported", "reauthentication_required", "target_unavailable", "failed"].includes(state)
      ? "loss"
      : ["paused", "learning", "pending"].includes(state)
        ? "warn"
        : "neutral";
  return <Badge variant={variant} size="md">{normalized}</Badge>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="space-y-1.5"><span className="text-xs font-medium text-text-secondary">{label}</span>{children}</label>;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  compact = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  compact?: boolean;
}) {
  return (
    <label className={cn(
      "flex items-center justify-between gap-3 rounded-lg border border-border-primary text-text-primary",
      compact ? "h-10 px-3 text-sm" : "min-h-14 px-3 py-2.5",
    )}>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-xs leading-4 text-text-tertiary">{description}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="h-10 w-full rounded-md border border-border-primary bg-background px-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </select>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  compact = false,
  action,
}: {
  icon: typeof Link2;
  title: string;
  body: string;
  compact?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "px-4 py-10" : "min-h-72 rounded-lg border border-dashed border-border-secondary bg-card-bg px-6 py-12",
    )}>
      <div className="flex size-10 items-center justify-center rounded-lg bg-bg-tertiary text-text-secondary">
        <Icon className="size-5" />
      </div>
      <h2 className="mt-3 font-semibold text-text-primary">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-6 text-text-secondary">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function routeInput(route: CopyRoute): CopyRouteInput {
  return {
    source_id: route.source_id,
    target_account_id: route.target_account_id,
    fixed_lot: route.fixed_lot,
    take_profit_mode: route.take_profit_mode,
    lot_distribution: route.lot_distribution,
    pending_orders_enabled: route.pending_orders_enabled,
    minimum_fields: route.minimum_fields,
    assembly_window_seconds: route.assembly_window_seconds,
    process_all_group_authors: route.process_all_group_authors,
    notify_success: route.notify_success,
    notify_failure: route.notify_failure,
    allow_sl_tp_updates: route.allow_sl_tp_updates,
    allow_break_even: route.allow_break_even,
    allow_additional_tp: route.allow_additional_tp,
    allow_partial_close: route.allow_partial_close,
    allow_full_close: route.allow_full_close,
    allow_pending_cancel: route.allow_pending_cancel,
    unsafe_minimum_confirmed: Boolean(route.unsafe_minimum_confirmed_at),
  };
}

function connectionName(item: TelegramConnection) {
  return item.display_name || item.username || item.phone_hint || "Telegram account";
}

function accountLabel(account: CopyTargetAccount | undefined, fallback: string) {
  if (!account) return `Account ${fallback.slice(0, 8)}`;
  return account.display_name?.trim() || `${account.broker_name} ${account.broker_login}`;
}

function takeProfitLabel(route: CopyRoute) {
  if (route.take_profit_mode === "lowest") return "Lowest TP";
  if (route.take_profit_mode === "highest") return "Highest TP";
  return route.lot_distribution === "split_total" ? "All · split lot" : "All · fixed each";
}

function confidenceVariant(confidence: "low" | "medium" | "high") {
  return confidence === "high" ? "win" : confidence === "medium" ? "warn" : "loss";
}

function activityTone(level: CopyActivityType["level"]) {
  return level === "success" ? "bg-success" : level === "error" ? "bg-danger" : level === "warning" ? "bg-warning" : "bg-info";
}

function humanAction(action: string) {
  return action.replaceAll(".", " ").replaceAll("_", " ");
}

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(value).toLocaleDateString();
}

function formatDetail(value: unknown) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function emergencyOptionLabel(item: CopyTargetAccount | TelegramSource | CopyRoute) {
  if ("broker_login" in item) return accountLabel(item, item.id);
  if ("title" in item) return item.title;
  return `Route ${item.id.slice(0, 8)} · ${item.fixed_lot} lot`;
}

function apiError(error: unknown) {
  const response = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (typeof response === "string") return response;
  if (Array.isArray(response)) {
    return response.map((item) => (typeof item === "object" && item && "msg" in item ? String(item.msg) : String(item))).join(" ");
  }
  return "Please try again.";
}
