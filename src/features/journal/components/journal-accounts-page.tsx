"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  RefreshCw,
  Trash2,
  Server,
  CheckCircle2,
  XCircle,
  Pencil,
  Upload
} from "lucide-react";
import {
  useJournalAccounts,
  useSyncJournalAccount,
  useDisconnectJournalAccount,
  useUpdateJournalAccount
} from "@/features/journal/hooks/use-journal-accounts";
import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppLoader } from "@/components/app-loader";
import { formatCurrency } from "./journal-day-modal.utils";
import {
  refreshJournalQueriesAfterManualSync,
  waitForQueuedJournalSyncCompletion,
} from "@/features/journal/lib/manual-sync-refresh";
import { toast } from "sonner";
import {
  getAccountSyncStatus,
  isAccountSyncHealthy,
} from "@/features/journal/lib/account-sync-status";

export function JournalAccountsPage() {
  const queryClient = useQueryClient();
  const { data: accounts = [], isLoading, refetch: refetchAccounts } = useJournalAccounts();
  const syncAccount = useSyncJournalAccount();
  const disconnectAccount = useDisconnectJournalAccount();
  const updateAccount = useUpdateJournalAccount();
  const openConnectModal = useJournalUiStore((s) => s.openConnectModal);
  const openCSVReimportModal = useJournalUiStore((s) => s.openCSVReimportModal);

  const [activeSyncingId, setActiveSyncingId] = useState<string | null>(null);

  const handleSyncAccount = async (accountId: string) => {
    setActiveSyncingId(accountId);
    try {
      const baselineAccount = accounts.find((account) => account.id === accountId);
      const result = await syncAccount.mutateAsync(accountId);
      if ("inserted_trades" in result) {
        await refreshJournalQueriesAfterManualSync(queryClient);
        return;
      }

      if ("status" in result && result.status === "queued") {
        const waitResult = await waitForQueuedJournalSyncCompletion({
          accountId,
          baselineLastSyncedAt: baselineAccount?.last_synced_at,
          refetchAccounts,
        });

        if (waitResult.status === "completed") {
          await refreshJournalQueriesAfterManualSync(queryClient);
        } else if (waitResult.status === "failed") {
          const syncStatus = getAccountSyncStatus(waitResult.account);
          toast.error(syncStatus.headline, {
            description: syncStatus.detail,
          });
        }
      }
    } catch (err) {
      console.error("Sync failed for account: " + accountId, err);
    } finally {
      setActiveSyncingId(null);
    }
  };

  const handleDeleteAccount = async (accountId: string, displayName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to disconnect account "${displayName}"? This will stop syncing your trades.`
    );
    if (!confirmed) return;

    try {
      await disconnectAccount.mutateAsync(accountId);
    } catch (err) {
      console.error("Failed to disconnect account", err);
    }
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return "Never synced";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const formatNextRetry = (dateString: string | null) => {
    if (!dateString) return null;
    const retryAt = new Date(dateString);
    const diffMs = retryAt.getTime() - Date.now();
    if (Number.isNaN(diffMs) || diffMs <= 0) return null;

    const diffMins = Math.ceil(diffMs / 60000);
    if (diffMins <= 1) return "Retrying within a minute";
    if (diffMins < 60) return `Retrying in ${diffMins} min`;

    const diffHours = Math.ceil(diffMins / 60);
    return `Retrying in ${diffHours} hr`;
  };

  const getSyncStatusDetail = (account: (typeof accounts)[number]) => {
    if (account.sync_provider === "csv_import") return null;
    const syncStatus = getAccountSyncStatus(account);
    if (syncStatus.code !== "ready") return syncStatus.detail;
    if (account.next_sync_not_before) {
      return formatNextRetry(account.next_sync_not_before) || "Next sync soon";
    }
    return null;
  };

  return (
    <div className="min-w-0 p-4 pb-20 font-sans text-text-primary md:p-8 md:pb-8">
      <div className="mx-auto max-w-[1680px] space-y-6">
        {/* Page header — title + add-account action (when accounts exist;
            the empty state has its own primary CTA). */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight">Trading Accounts</h1>
          {!isLoading && accounts.length > 0 ? (
            <Button
              type="button"
              onClick={openConnectModal}
              className="flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              Connect Account
            </Button>
          ) : null}
        </div>

        {/* Main content area */}
        {isLoading ? (
          <AppLoader label="Loading accounts" />
        ) : accounts.length === 0 ? (
          /* Empty State */
          <Card className="border-border-secondary bg-card-bg py-16 text-center shadow-sm">
            <CardContent className="flex flex-col items-center justify-center max-w-md mx-auto space-y-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Server className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight">
                  Connect your trading account
                </h2>
                <p className="text-sm text-text-tertiary leading-relaxed">
                  Sync your MT5 trades instantly with our secure API connection. Get access to detailed setup statistics, AI reviews, and trade logs.
                </p>
              </div>
              <Button
                onClick={openConnectModal}
                className="bg-brand text-brand-foreground hover:bg-brand-hover text-sm font-bold h-10 px-6 rounded-full shadow-lg hover:shadow-brand/20 transition-all"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Connect MT5 Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Accounts Table Layout */
          <Card className="border border-border-secondary bg-card-bg overflow-hidden shadow-sm rounded-xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm font-semibold">
                  <thead>
                    <tr className="border-b border-border-secondary bg-bg-secondary/40 text-text-tertiary text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-bold">Name</th>
                      <th className="px-6 py-4 font-bold">Number</th>
                      <th className="px-6 py-4 font-bold">Server</th>
                      <th className="px-6 py-4 font-bold">Type</th>
                      <th className="px-6 py-4 font-bold">Platform</th>
                      <th className="px-6 py-4 font-bold">Balance</th>
                      <th className="px-6 py-4 font-bold">Connection</th>
                      <th className="px-6 py-4 font-bold">Last Sync</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-secondary/40">
                    {accounts.map((account) => {
                      const isSyncing = activeSyncingId === account.id;
                      const accountLabel = account.display_name || "MT5 Trading Account";
                      const syncStatus = getAccountSyncStatus(account);
                      const isConnectionReady = isAccountSyncHealthy(syncStatus);
                      const needsAttention =
                        syncStatus.severity === "warning" ||
                        syncStatus.severity === "error";
                      const balanceText =
                        account.latest_balance == null
                          ? "--"
                          : formatCurrency(
                              Number(account.latest_balance),
                              account.currency,
                            );
                      const syncStatusDetail = getSyncStatusDetail(account);
                      
                      return (
                        <tr
                          key={account.id}
                          className="hover:bg-bg-primary/20 transition-colors"
                        >
                          {/* Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {isConnectionReady ? (
                                <CheckCircle2 className="h-4 w-4 text-kpi-metric-positive flex-shrink-0" />
                              ) : syncStatus.severity === "pending" ? (
                                <RefreshCw className="h-4 w-4 animate-spin text-info flex-shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-danger flex-shrink-0" />
                              )}
                              <span className="text-text-primary font-bold">
                                {accountLabel}
                              </span>
                            </div>
                          </td>

                          {/* Number */}
                          <td className="px-6 py-4 text-text-secondary">
                            {account.broker_login}
                          </td>

                          {/* Server */}
                          <td className="px-6 py-4 text-text-tertiary font-medium">
                            {account.broker_server}
                          </td>

                          {/* Type */}
                          <td className="px-6 py-4">
                            {account.account_type === "live" ? (
                              <span className="rounded bg-badge-info-bg px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-badge-info-fg">
                                Live
                              </span>
                            ) : (
                              <span className="rounded bg-badge-warn-bg px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-badge-warn-fg">
                                Demo
                              </span>
                            )}
                          </td>

                          {/* Platform */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-text-primary text-xs font-bold">
                                MT5
                              </span>
                            </div>
                          </td>

                          {/* Balance */}
                          <td className="px-6 py-4 text-text-primary font-bold">
                            {balanceText}
                          </td>

                          {/* Connection */}
                          <td className="px-6 py-4">
                            {account.sync_provider === "csv_import" ? (
                              <span className="rounded bg-badge-warn-bg px-2 py-0.5 text-[10px] font-bold text-badge-warn-fg uppercase tracking-wider">
                                CSV
                              </span>
                            ) : needsAttention ? (
                              <span className="rounded bg-danger/15 px-2 py-0.5 text-[10px] font-bold text-danger uppercase tracking-wider">
                                Attention
                              </span>
                            ) : (
                              <span className="rounded bg-bg-tertiary px-2 py-0.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                                API
                              </span>
                            )}
                          </td>

                          {/* Last Sync */}
                          <td className="px-6 py-4 text-xs">
                            <div className="space-y-1">
                              <div className="text-text-secondary">
                                {account.sync_provider === "csv_import"
                                  ? `Last import: ${formatLastSync(account.last_synced_at)}`
                                  : formatLastSync(account.last_synced_at)}
                              </div>
                              {syncStatusDetail ? (
                                <div className="text-[11px] font-medium text-text-tertiary">
                                  {syncStatusDetail}
                                </div>
                              ) : null}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3.5">
                              {account.sync_provider === "csv_import" ? (
                                <button
                                  onClick={() => openCSVReimportModal(account.id)}
                                  className="text-info hover:text-info/80 transition-colors hover:scale-110 duration-150"
                                  title="Import more trades"
                                >
                                  <Upload className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSyncAccount(account.id)}
                                  disabled={isSyncing}
                                  className="text-info hover:text-info/80 disabled:opacity-50 transition-colors hover:scale-110 duration-150"
                                  title="Sync account trades"
                                >
                                  <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin text-brand" : ""}`} />
                                </button>
                              )}
                              
                              <button
                                onClick={async () => {
                                  const newName = window.prompt("Enter a new display name for this account:", accountLabel);
                                  if (newName && newName.trim()) {
                                    try {
                                      await updateAccount.mutateAsync({
                                        accountId: account.id,
                                        displayName: newName.trim(),
                                      });
                                    } catch (err) {
                                      console.error("Rename failed", err);
                                      alert("Failed to rename account display name.");
                                    }
                                  }
                                }}
                                disabled={updateAccount.isPending}
                                className="text-info hover:text-info/80 disabled:opacity-50 transition-colors hover:scale-110 duration-150"
                                title="Edit display name"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteAccount(account.id, accountLabel)}
                                className="text-danger hover:text-danger/80 transition-colors hover:scale-110 duration-150"
                                title="Disconnect account"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
