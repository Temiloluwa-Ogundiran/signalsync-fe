"use client";

import { Check, Copy, ExternalLink, Link2, RefreshCw, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { SettingsPageShell } from "@/features/settings/components/settings-page-shell";
import { useAffiliateDashboard } from "./hooks";

function money(value: string, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function date(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export function AffiliatePage() {
  const query = useAffiliateDashboard();
  const data = query.data;

  async function copyLink() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.referral_url);
      toast.success("Referral link copied");
    } catch {
      toast.error("Couldn't copy the link. Select and copy it manually.");
    }
  }

  if (query.isLoading) {
    return <SettingsPageShell title="Affiliate program"><p className="flex items-center gap-2 text-sm text-text-secondary"><RefreshCw className="size-4 animate-spin" />Loading your affiliate details</p></SettingsPageShell>;
  }
  if (!data) {
    return <SettingsPageShell title="Affiliate program"><button type="button" onClick={() => query.refetch()} className="text-sm font-semibold text-accent underline">Try again</button></SettingsPageShell>;
  }

  const totals = [
    ["Referred users", data.referrals],
    ["Paying referrals", data.paid_referrals],
    ["Pending", money(data.pending_balance)],
    ["Available", money(data.available_balance)],
  ];

  return (
    <SettingsPageShell
      title="Affiliate program"
      description="Share your link. Commission is recorded after a referred user pays, then becomes available after the holding period."
    >
      <section className="border-y border-border-primary py-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Your referral code</p>
            <p className="mt-2 font-mono text-3xl font-semibold tracking-[0.14em] text-text-primary">{data.code}</p>
            <p className="mt-2 text-sm text-text-secondary">{data.effective_commission_rate}% commission on each eligible payment for up to {data.recurring_months} months.</p>
          </div>
          <div className="hidden border-l border-border-primary pl-6 sm:block" aria-label="Referral QR code">
            <QRCodeSVG value={data.referral_url} size={104} bgColor="transparent" fgColor="currentColor" className="text-text-primary" />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-md border border-border-primary bg-bg-input p-2">
          <Link2 aria-hidden className="ml-1 size-4 shrink-0 text-text-muted" />
          <input aria-label="Your referral link" readOnly value={data.referral_url} className="min-w-0 flex-1 bg-transparent px-1 text-sm text-text-primary outline-none" />
          <button type="button" onClick={copyLink} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-accent px-3 text-sm font-semibold text-accent-foreground hover:opacity-90"><Copy className="size-4" />Copy</button>
        </div>
      </section>

      <section aria-label="Affiliate totals" className="grid border-y border-border-primary sm:grid-cols-2 lg:grid-cols-4">
        {totals.map(([label, value]) => <div key={String(label)} className="border-b border-border-primary px-4 py-5 last:border-b-0 sm:border-r lg:border-b-0"><p className="text-xs text-text-muted">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-text-primary">{value}</p></div>)}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4"><div><h2 className="text-base font-semibold text-text-primary">Commission activity</h2><p className="mt-1 text-sm text-text-secondary">Pending commission becomes available after {data.commission_hold_days} days. Minimum payout: {money(data.minimum_payout)}.</p></div><button type="button" title="Refresh commission activity" aria-label="Refresh commission activity" onClick={() => query.refetch()} className="flex size-9 items-center justify-center rounded-md border border-border-primary text-text-secondary hover:bg-bg-hover"><RefreshCw className="size-4" /></button></div>
        {data.commissions.length ? <div className="overflow-x-auto border-y border-border-primary"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-bg-secondary text-xs uppercase text-text-muted"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Commission</th><th className="px-4 py-3">Rate</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Available</th></tr></thead><tbody className="divide-y divide-border-primary">{data.commissions.map((item) => <tr key={item.id}><td className="px-4 py-4 text-text-secondary">{date(item.created_at)}</td><td className="px-4 py-4 font-medium tabular-nums text-text-primary">{money(item.commission_amount, item.currency)}</td><td className="px-4 py-4 text-text-secondary">{item.commission_rate}%</td><td className="px-4 py-4"><span className={item.status === "available" ? "text-success" : item.status === "reversed" ? "text-danger" : "text-warning"}>{item.status}</span></td><td className="px-4 py-4 text-text-secondary">{item.status === "pending" ? date(item.release_at) : item.status === "available" ? "Ready" : "-"}</td></tr>)}</tbody></table></div> : <div className="border-y border-border-primary py-10 text-center"><Users className="mx-auto size-5 text-text-muted" /><p className="mt-3 text-sm font-medium text-text-primary">No commissions yet</p><p className="mt-1 text-sm text-text-secondary">Your first eligible payment from a referred user will appear here.</p></div>}
      </section>

      <p className="flex items-start gap-2 text-xs leading-5 text-text-muted"><Check className="mt-0.5 size-3.5 shrink-0 text-success" />Your referral relationship is set when a new user registers through your link. It cannot be changed afterwards.</p>
    </SettingsPageShell>
  );
}
