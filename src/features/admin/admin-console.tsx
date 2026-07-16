"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ExternalLink, RefreshCw, Search, ShieldOff, UserRoundCheck, X } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "./api";
import type { AdminUser, PlatformRole } from "./types";

type View = "overview" | "users" | "system" | "audit";

const roleLabel: Record<PlatformRole, string> = {
  user: "User",
  admin: "Administrator",
  technical_admin: "Technical administrator",
  super_admin: "Super administrator",
};

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Never";
}

function Status({ healthy }: { healthy: boolean }) {
  return <span className={healthy ? "text-success" : "text-warning"}>{healthy ? "Healthy" : "Needs attention"}</span>;
}

export function AdminConsole({ view }: { view: View }) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-7 lg:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border-primary pb-5">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-text-muted">Operations</p>
          <h1 className="text-2xl font-semibold text-text-primary">Administration</h1>
          <p className="mt-1 text-sm text-text-secondary">Users, product adoption, system health, and accountable actions.</p>
        </div>
        <nav aria-label="Administration sections" className="flex gap-1 rounded-md border border-border-primary bg-bg-secondary p-1 text-sm">
          {["overview", "users", "system", "audit"].map((item) => (
            <Link key={item} href={item === "overview" ? "/admin" : `/admin/${item}`} className={`rounded px-3 py-2 capitalize ${view === item ? "bg-bg-primary font-semibold text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>{item}</Link>
          ))}
        </nav>
      </div>
      {view === "overview" ? <Overview token={token} /> : null}
      {view === "users" ? <Users token={token} canChangeRole={session?.user.platformRole === "super_admin"} /> : null}
      {view === "system" ? <System token={token} /> : null}
      {view === "audit" ? <Audit token={token} /> : null}
    </div>
  );
}

function Overview({ token }: { token?: string }) {
  const query = useQuery({ queryKey: ["admin", "overview"], queryFn: () => adminApi.overview(token), enabled: !!token });
  if (query.isLoading) return <Loading />;
  if (!query.data) return <ErrorState retry={() => query.refetch()} />;
  const { totals, signups, funnel, product } = query.data;
  const stats = [
    ["Total users", totals.users], ["Active in 24h", totals.active_24h], ["Trading accounts", totals.trading_accounts],
    ["Copy accounts", totals.copy_accounts], ["Suspended", totals.suspended], ["Bounce rate", `${product.bounce_rate}%`],
  ];
  return <div className="space-y-7">
    <section aria-label="Platform totals" className="grid border-y border-border-primary sm:grid-cols-2 lg:grid-cols-6">
      {stats.map(([label, value]) => <div key={label} className="border-b border-border-primary px-4 py-5 last:border-b-0 sm:border-r lg:border-b-0"><p className="text-xs text-text-muted">{label}</p><p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p></div>)}
    </section>
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)]">
      <section>
        <h2 className="text-base font-semibold text-text-primary">New users</h2><p className="mb-4 text-sm text-text-secondary">Daily registrations over the last 30 days.</p>
        <div className="h-72 border-y border-border-primary py-4">
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={signups}><defs><linearGradient id="signup" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.25}/><stop offset="100%" stopColor="#22c55e" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="var(--border-primary)" vertical={false}/><XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(v) => v.slice(5)}/><YAxis allowDecimals={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }}/><Tooltip/><Area type="monotone" dataKey="count" stroke="#22c55e" fill="url(#signup)" strokeWidth={2}/></AreaChart></ResponsiveContainer>
        </div>
      </section>
      <section>
        <h2 className="text-base font-semibold text-text-primary">Activation funnel</h2><p className="mb-4 text-sm text-text-secondary">Distinct sessions reaching each product milestone.</p>
        <div className="divide-y divide-border-primary border-y border-border-primary">{funnel.map((item, index) => { const max = funnel[0]?.sessions || 1; return <div key={item.stage} className="py-3"><div className="mb-2 flex justify-between text-sm"><span className="capitalize text-text-secondary">{item.stage.replaceAll("_", " ")}</span><span className="font-medium text-text-primary">{item.sessions}</span></div><div className="h-1.5 bg-bg-tertiary"><div className="h-full bg-success" style={{ width: `${Math.max(2, item.sessions / max * 100)}%` }}/></div>{index === 0 ? null : <span className="sr-only">Funnel stage {index + 1}</span>}</div>})}</div>
      </section>
    </div>
  </div>;
}

function Users({ token, canChangeRole }: { token?: string; canChangeRole: boolean }) {
  const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [selected, setSelected] = useState<AdminUser | null>(null);
  const params = useMemo(() => Object.fromEntries(Object.entries({ query: search, user_status: status }).filter(([, value]) => value)), [search, status]);
  const query = useQuery({ queryKey: ["admin", "users", params], queryFn: () => adminApi.users(token, params), enabled: !!token });
  return <section>
    <div className="mb-4 flex flex-wrap gap-3"><label className="relative min-w-64 flex-1"><span className="sr-only">Search users</span><Search className="absolute left-3 top-3 h-4 w-4 text-text-muted"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="h-10 w-full rounded-md border border-border-primary bg-bg-input pl-9 pr-3 text-sm text-text-primary outline-none focus:border-text-muted"/></label><select aria-label="Filter user status" value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-md border border-border-primary bg-bg-input px-3 text-sm text-text-primary"><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="unverified">Unverified</option><option value="deleted">Deleted</option></select></div>
    <div className="overflow-x-auto border-y border-border-primary"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-bg-secondary text-xs uppercase text-text-muted"><tr>{["User", "Role", "State", "Accounts", "Last active", "Joined"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-border-primary">{query.data?.items.map((user) => <tr key={user.id} onClick={() => setSelected(user)} className="cursor-pointer hover:bg-bg-hover"><td className="px-4 py-4"><p className="font-medium text-text-primary">{user.display_name || "Unnamed user"}</p><p className="text-text-muted">{user.email}</p></td><td className="px-4 py-4 text-text-secondary">{roleLabel[user.platform_role]}</td><td className="px-4 py-4"><span className={user.is_suspended ? "text-danger" : user.is_email_verified ? "text-success" : "text-warning"}>{user.is_suspended ? "Suspended" : user.is_email_verified ? "Active" : "Unverified"}</span></td><td className="px-4 py-4 text-text-secondary">{user.trading_account_count} journal / {user.copy_account_count} copy</td><td className="px-4 py-4 text-text-secondary">{formatDate(user.last_active_at)}</td><td className="px-4 py-4 text-text-secondary">{formatDate(user.created_at)}</td></tr>)}</tbody></table>{query.isLoading ? <Loading/> : null}{query.data?.items.length === 0 ? <p className="p-8 text-center text-sm text-text-muted">No users match these filters.</p> : null}</div>
    {selected ? <UserPanel user={selected} token={token} canChangeRole={canChangeRole} close={() => setSelected(null)} /> : null}
  </section>;
}

function UserPanel({ user, token, canChangeRole, close }: { user: AdminUser; token?: string; canChangeRole: boolean; close: () => void }) {
  const client = useQueryClient(); const [reason, setReason] = useState(""); const [role, setRole] = useState<PlatformRole>(user.platform_role);
  const detail = useQuery({ queryKey: ["admin", "user", user.id], queryFn: () => adminApi.user(token, user.id) });
  const mutation = useMutation({ mutationFn: async (action: "suspend" | "restore" | "sessions" | "role") => { if (action === "suspend") { if (reason.trim().length < 3) throw new Error("Enter a clear reason before suspending this user."); return adminApi.suspend(token, user.id, reason); } if (action === "restore") return adminApi.restore(token, user.id); if (action === "sessions") return adminApi.revokeSessions(token, user.id); if (reason.trim().length < 3) throw new Error("Enter a reason for this role change."); return adminApi.role(token, user.id, role, reason); }, onSuccess: () => { toast.success("User account updated"); client.invalidateQueries({ queryKey: ["admin"] }); close(); }, onError: (error) => toast.error(error instanceof Error ? error.message : "The account could not be updated.") });
  return <div className="fixed inset-0 z-modal flex justify-end bg-overlay" role="dialog" aria-modal="true" aria-label="User details"><button type="button" className="flex-1" aria-label="Close user details" onClick={close}/><div className="h-full w-full max-w-xl overflow-y-auto border-l border-border-primary bg-bg-primary p-6 shadow-xl"><div className="mb-6 flex items-start justify-between"><div><h2 className="text-xl font-semibold text-text-primary">{user.display_name || "Unnamed user"}</h2><p className="text-sm text-text-secondary">{user.email}</p></div><button type="button" onClick={close} className="rounded p-2 hover:bg-bg-hover" aria-label="Close"><X className="h-5 w-5"/></button></div>
    {detail.data ? <div className="space-y-6"><dl className="grid grid-cols-2 gap-x-5 gap-y-4 text-sm">{[["Role", roleLabel[detail.data.platform_role]], ["Provider", detail.data.auth_provider], ["Sessions", detail.data.active_sessions], ["Last active", formatDate(detail.data.last_active_at)], ["Journal accounts", detail.data.trading_account_count], ["Copy accounts", detail.data.copy_account_count]].map(([k,v]) => <div key={k}><dt className="text-text-muted">{k}</dt><dd className="mt-1 font-medium text-text-primary">{v}</dd></div>)}</dl>
      <div><label className="mb-2 block text-sm font-medium text-text-primary">Reason for administrative action</label><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Required for suspension and role changes" className="w-full rounded-md border border-border-primary bg-bg-input p-3 text-sm text-text-primary"/></div>
      {canChangeRole ? <div className="flex gap-2"><select value={role} onChange={(e) => setRole(e.target.value as PlatformRole)} className="h-10 flex-1 rounded-md border border-border-primary bg-bg-input px-3 text-sm"><option value="user">User</option><option value="admin">Administrator</option><option value="technical_admin">Technical administrator</option><option value="super_admin">Super administrator</option></select><button type="button" onClick={() => mutation.mutate("role")} className="rounded-md border border-border-primary px-4 text-sm font-semibold hover:bg-bg-hover">Change role</button></div> : null}
      <div className="flex flex-wrap gap-2 border-t border-border-primary pt-5"><button type="button" onClick={() => mutation.mutate("sessions")} className="rounded-md border border-border-primary px-4 py-2 text-sm font-semibold hover:bg-bg-hover">Revoke sessions</button>{detail.data.is_suspended ? <button type="button" onClick={() => mutation.mutate("restore")} className="inline-flex items-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-semibold text-white"><UserRoundCheck className="h-4 w-4"/>Restore access</button> : <button type="button" onClick={() => mutation.mutate("suspend")} className="inline-flex items-center gap-2 rounded-md bg-danger px-4 py-2 text-sm font-semibold text-white"><ShieldOff className="h-4 w-4"/>Suspend</button>}</div>
    </div> : <Loading/>}</div></div>;
}

function System({ token }: { token?: string }) {
  const query = useQuery({ queryKey: ["admin", "system"], queryFn: () => adminApi.system(token), enabled: !!token, refetchInterval: 15_000 });
  if (query.isLoading) return <Loading/>; if (!query.data) return <ErrorState retry={() => query.refetch()}/>; const data = query.data;
  return <div className="space-y-7"><div className="flex items-center justify-between border-y border-border-primary py-4"><div><p className="text-sm text-text-muted">Platform status</p><p className="mt-1 text-lg font-semibold text-text-primary"><Status healthy={data.status === "healthy"}/></p></div><div className="flex gap-2"><button type="button" onClick={() => query.refetch()} className="rounded-md border border-border-primary p-2" aria-label="Refresh system health"><RefreshCw className="h-4 w-4"/></button>{data.grafana_url ? <a href={data.grafana_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Open Grafana<ExternalLink className="h-4 w-4"/></a> : null}</div></div>
    <section><h2 className="mb-3 text-base font-semibold text-text-primary">Worker health</h2><div className="overflow-x-auto border-y border-border-primary"><table className="w-full text-left text-sm"><thead className="bg-bg-secondary text-xs uppercase text-text-muted"><tr>{["Component", "Status", "Heartbeat", "Stream lag", "Pending", "Last error"].map((h)=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-border-primary">{data.components.map((c)=><tr key={c.name}><td className="px-4 py-4 font-medium text-text-primary">{c.name}</td><td className="px-4 py-4"><Status healthy={c.status === "healthy"}/></td><td className="px-4 py-4 text-text-secondary">{c.heartbeat_age_seconds}s ago</td><td className="px-4 py-4 text-text-secondary">{c.stream_lag}</td><td className="px-4 py-4 text-text-secondary">{c.pending}</td><td className="max-w-sm truncate px-4 py-4 text-text-muted">{c.last_error || "None"}</td></tr>)}</tbody></table></div></section>
    <section><h2 className="mb-3 text-base font-semibold text-text-primary">Copy execution latency</h2><dl className="grid border-y border-border-primary sm:grid-cols-4">{[["Samples", data.copy_latency.samples], ["Median", `${data.copy_latency.p50_ms ?? 0} ms`], ["95th percentile", `${data.copy_latency.p95_ms ?? 0} ms`], ["Over 2 seconds", data.copy_latency.over_2s]].map(([k,v])=><div key={k} className="border-b border-border-primary p-4 sm:border-b-0 sm:border-r"><dt className="text-xs text-text-muted">{k}</dt><dd className="mt-2 text-xl font-semibold text-text-primary">{v}</dd></div>)}</dl></section>
  </div>;
}

function Audit({ token }: { token?: string }) { const query = useQuery({ queryKey: ["admin", "audit"], queryFn: () => adminApi.audit(token), enabled: !!token }); if (query.isLoading) return <Loading/>; return <div className="overflow-x-auto border-y border-border-primary"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-bg-secondary text-xs uppercase text-text-muted"><tr>{["Time", "Administrator", "Action", "User", "Reason"].map((h)=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-border-primary">{query.data?.items.map((item)=><tr key={item.id}><td className="px-4 py-4 text-text-secondary">{formatDate(item.created_at)}</td><td className="px-4 py-4 text-text-primary">{item.actor_email}</td><td className="px-4 py-4 text-text-secondary">{item.action.replaceAll(".", " ")}</td><td className="px-4 py-4 text-text-secondary">{item.target_email || "System"}</td><td className="px-4 py-4 text-text-muted">{item.reason || "Not required"}</td></tr>)}</tbody></table>{query.data?.items.length === 0 ? <p className="p-8 text-center text-sm text-text-muted">No administrative actions recorded yet.</p> : null}</div>; }

function Loading() { return <div className="flex items-center gap-2 p-8 text-sm text-text-muted"><RefreshCw className="h-4 w-4 animate-spin"/>Loading current data</div>; }
function ErrorState({ retry }: { retry: () => void }) { return <div className="flex items-center justify-between border-y border-warning py-5 text-sm"><span className="flex items-center gap-2 text-warning-text"><AlertTriangle className="h-4 w-4"/>This data could not be loaded.</span><button type="button" onClick={retry} className="font-semibold underline">Try again</button></div>; }
