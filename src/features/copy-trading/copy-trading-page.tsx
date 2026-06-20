"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Link2,
  Radio,
  Route,
  Save,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AppLoader } from "@/components/app-loader";
import { cn } from "@/lib/utils";
import {
  useCopyAccountPolicies,
  useCopyActivity,
  useCopyRoutes,
  useCopyTradingSettings,
  useCopyTargetAccounts,
  useUpdateCopyAccountPolicy,
  useUpdateCopyTradingSettings,
} from "./hooks";
import type { CopyAccountPolicy, CopyActivity as CopyActivityType } from "./types";

export type CopyTradingView = "overview" | "routes" | "accounts" | "activity";

const viewMeta: Record<CopyTradingView, { title: string; description: string }> = {
  overview: { title: "Copy Trading", description: "Automation status and routing health" },
  routes: { title: "Copy Routes", description: "Telegram sources mapped to MT5 accounts" },
  accounts: { title: "Account Controls", description: "Maximum lots and account-level pause controls" },
  activity: { title: "Copy Activity", description: "A permanent timeline of automated actions" },
};

export function CopyTradingPage({ view }: { view: CopyTradingView }) {
  const settings = useCopyTradingSettings();
  const routes = useCopyRoutes();
  const policies = useCopyAccountPolicies();
  const activity = useCopyActivity();
  const updateSettings = useUpdateCopyTradingSettings();
  const meta = viewMeta[view];

  const isLoading = settings.isLoading || routes.isLoading || policies.isLoading;
  if (isLoading) return <AppLoader />;

  const handleAutomation = async (enabled: boolean) => {
    try {
      await updateSettings.mutateAsync(!enabled);
      toast.success(enabled ? "Copy trading resumed" : "Copy trading paused");
    } catch {
      toast.error("Could not update copy trading");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <header className="flex flex-col gap-4 border-b border-border-primary pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{meta.title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{meta.description}</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border-primary bg-card-bg px-3 py-2">
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
      </header>

      {view === "overview" ? (
        <Overview
          routeCount={routes.data?.length ?? 0}
          activeCount={routes.data?.filter((route) => route.state === "active").length ?? 0}
          activity={activity.data ?? []}
        />
      ) : null}
      {view === "routes" ? <RoutesTable routes={routes.data ?? []} /> : null}
      {view === "accounts" ? <AccountControls policies={policies.data ?? []} /> : null}
      {view === "activity" ? <ActivityTimeline events={activity.data ?? []} /> : null}
    </div>
  );
}

function Overview({ routeCount, activeCount, activity }: { routeCount: number; activeCount: number; activity: CopyActivityType[] }) {
  return (
    <div className="space-y-6 pt-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <Metric icon={Route} label="Configured routes" value={routeCount} />
        <Metric icon={Radio} label="Active routes" value={activeCount} />
        <Metric icon={Activity} label="Recent events" value={activity.length} />
      </section>
      <section className="overflow-hidden rounded-lg border border-border-primary bg-card-bg">
        <div className="flex items-center justify-between border-b border-border-primary px-4 py-3">
          <h2 className="font-semibold text-text-primary">Recent activity</h2>
          <Link href="/copy-trading/activity" className="text-sm font-medium text-text-secondary hover:text-text-primary">View all</Link>
        </div>
        <ActivityTimeline events={activity.slice(0, 5)} embedded />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Route; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-primary bg-card-bg p-4">
      <div className="flex size-9 items-center justify-center rounded-md bg-bg-tertiary text-text-secondary"><Icon className="size-4" /></div>
      <div><p className="text-xl font-bold tabular-nums text-text-primary">{value}</p><p className="text-xs text-text-secondary">{label}</p></div>
    </div>
  );
}

function RoutesTable({ routes }: { routes: ReturnType<typeof useCopyRoutes>["data"] extends infer T ? NonNullable<T> : never }) {
  if (!routes.length) {
    return <EmptyState icon={Link2} title="No copy routes yet" body="Telegram connections will become available in the next rollout. Your MT5 accounts and safety controls can be prepared now." />;
  }
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border-primary bg-card-bg">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-border-primary bg-bg-tertiary text-xs uppercase text-text-tertiary"><tr><th className="px-4 py-3">Source</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Fixed lot</th><th className="px-4 py-3">TP mode</th><th className="px-4 py-3">State</th></tr></thead>
        <tbody>{routes.map((route) => <tr key={route.id} className="border-b border-border-primary last:border-0"><td className="px-4 py-4 font-mono text-xs text-text-secondary">{route.source_id.slice(0, 8)}</td><td className="px-4 py-4 font-mono text-xs text-text-secondary">{route.target_account_id.slice(0, 8)}</td><td className="px-4 py-4 font-semibold text-text-primary">{route.fixed_lot}</td><td className="px-4 py-4 capitalize text-text-secondary">{route.take_profit_mode}</td><td className="px-4 py-4"><StateLabel state={route.state} /></td></tr>)}</tbody>
      </table>
    </div>
  );
}

function AccountControls({ policies }: { policies: CopyAccountPolicy[] }) {
  const { data: accounts = [], isLoading } = useCopyTargetAccounts();
  if (isLoading) return <AppLoader />;
  if (!accounts.length) return <EmptyState icon={ShieldCheck} title="Connect an MT5 account first" body="Account safety limits become available after MT5 verification succeeds." />;
  return <div className="mt-6 overflow-hidden rounded-lg border border-border-primary bg-card-bg">{accounts.map((account) => <AccountPolicyRow key={account.id} accountId={account.id} accountLabel={account.display_name?.trim() || `${account.broker_name} ${account.broker_login}`} policy={policies.find((item) => item.account_id === account.id)} />)}</div>;
}

function AccountPolicyRow({ accountId, accountLabel, policy }: { accountId: string; accountLabel: string; policy?: CopyAccountPolicy }) {
  const [maxLot, setMaxLot] = useState(policy?.max_lot ?? "100.0000");
  const mutation = useUpdateCopyAccountPolicy();
  const save = async (payload: { max_lot?: string; is_paused?: boolean }) => {
    try { await mutation.mutateAsync({ accountId, payload }); toast.success("Account controls updated"); }
    catch { toast.error("Could not update account controls"); }
  };
  return (
    <div className="grid gap-4 border-b border-border-primary p-4 last:border-0 sm:grid-cols-[1fr_180px_auto_auto] sm:items-center">
      <div><p className="font-semibold text-text-primary">{accountLabel}</p><p className="mt-0.5 font-mono text-xs text-text-tertiary">{accountId.slice(0, 8)}</p></div>
      <label className="space-y-1"><span className="text-xs font-medium text-text-secondary">Maximum lot</span><Input type="number" min="0.0001" step="0.01" value={maxLot} onChange={(event) => setMaxLot(event.target.value)} /></label>
      <div className="flex items-center gap-2"><Switch checked={!policy?.is_paused} onCheckedChange={(enabled) => save({ is_paused: !enabled })} disabled={mutation.isPending} /><span className="text-sm text-text-secondary">{policy?.is_paused ? "Paused" : "Enabled"}</span></div>
      <Button variant="outline" onClick={() => save({ max_lot: maxLot })} disabled={mutation.isPending || !maxLot}><Save className="size-4" />Save</Button>
    </div>
  );
}

function ActivityTimeline({ events, embedded = false }: { events: CopyActivityType[]; embedded?: boolean }) {
  if (!events.length) return <EmptyState icon={Activity} title="No activity yet" body="Copy-trading actions and safety changes will appear here." compact={embedded} />;
  return <div className={cn("divide-y divide-border-primary", embedded ? "" : "mt-6 overflow-hidden rounded-lg border border-border-primary bg-card-bg")}>{events.map((event) => <div key={event.id} className="flex gap-3 px-4 py-4"><div className={cn("mt-1 size-2 shrink-0 rounded-full", event.level === "success" ? "bg-success" : event.level === "error" ? "bg-danger" : event.level === "warning" ? "bg-warning" : "bg-info")} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium text-text-primary">{event.title}</p><time className="text-xs text-text-tertiary">{new Date(event.created_at).toLocaleString()}</time></div>{event.body ? <p className="mt-1 text-sm text-text-secondary">{event.body}</p> : null}<p className="mt-1 text-xs text-text-tertiary">{event.action.replaceAll(".", " ")}</p></div></div>)}</div>;
}

function StateLabel({ state }: { state: string }) { return <span className="inline-flex rounded-md bg-bg-tertiary px-2 py-1 text-xs font-semibold capitalize text-text-secondary">{state.replaceAll("_", " ")}</span>; }

function EmptyState({ icon: Icon, title, body, compact = false }: { icon: typeof Link2; title: string; body: string; compact?: boolean }) {
  return <div className={cn("flex flex-col items-center justify-center text-center", compact ? "px-4 py-10" : "mt-6 min-h-72 rounded-lg border border-dashed border-border-secondary bg-card-bg px-6 py-12")}><div className="flex size-10 items-center justify-center rounded-lg bg-bg-tertiary text-text-secondary"><Icon className="size-5" /></div><h2 className="mt-3 font-semibold text-text-primary">{title}</h2><p className="mt-1 max-w-md text-sm leading-6 text-text-secondary">{body}</p></div>;
}
