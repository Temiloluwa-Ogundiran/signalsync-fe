"use client";

import { useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  RefreshCw,
  Trash2,
  Archive,
  Server,
  Pencil,
  Upload,
  PlugZap,
} from "lucide-react";
import {
  useJournalAccounts,
  useSyncJournalAccount,
  useDisconnectJournalAccount,
  useDeleteJournalAccount,
  useUnarchiveJournalAccount,
  useUpdateJournalAccount
} from "@/features/journal/hooks/use-journal-accounts";
import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AppLoader } from "@/components/app-loader";
import { cn } from "@/lib/utils";
import { formatCurrency } from "./journal-day-modal.utils";
import {
  refreshJournalQueriesAfterManualSync,
  waitForQueuedJournalSyncCompletion,
} from "@/features/journal/lib/manual-sync-refresh";
import { toast } from "sonner";
import { getAccountSyncStatus } from "@/features/journal/lib/account-sync-status";

/**
 * Icon button with a styled hover tooltip describing what it does.
 * Mirrors the sidebar nav tooltip pattern (app-nav.tsx).
 */
function IconAction({
  icon: Icon,
  label,
  onClick,
  disabled,
  iconClassName,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  iconClassName?: string;
  className?: string;
}) {
  return (
    <div className="group/btn relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          "rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-text-primary disabled:opacity-50",
          className,
        )}
      >
        <Icon className={cn("h-4 w-4", iconClassName)} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-tooltip mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border-secondary bg-card-bg px-2 py-1 text-xs font-medium text-text-primary opacity-0 shadow-lg transition-opacity duration-100 group-hover/btn:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}

export function JournalAccountsPage() {
  const queryClient = useQueryClient();
  const { data: accounts = [], isLoading, refetch: refetchAccounts } =
    useJournalAccounts({ includeArchived: true });
  const syncAccount = useSyncJournalAccount();
  const disconnectAccount = useDisconnectJournalAccount();
  const deleteAccount = useDeleteJournalAccount();
  const unarchiveAccount = useUnarchiveJournalAccount();
  const updateAccount = useUpdateJournalAccount();
  const openConnectModal = useJournalUiStore((s) => s.openConnectModal);
  const openCSVReimportModal = useJournalUiStore((s) => s.openCSVReimportModal);

  const [activeSyncingId, setActiveSyncingId] = useState<string | null>(null);

  // Account action dialogs (archive / delete confirmation, rename input).
  type AccountAction = {
    type: "archive" | "delete" | "rename" | "reconnect";
    accountId: string;
    accountLabel: string;
  };
  const [accountAction, setAccountAction] = useState<AccountAction | null>(
    null,
  );
  const [renameValue, setRenameValue] = useState("");

  const closeAccountAction = () => setAccountAction(null);

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

  const openArchiveDialog = (accountId: string, accountLabel: string) =>
    setAccountAction({ type: "archive", accountId, accountLabel });

  const openDeleteDialog = (accountId: string, accountLabel: string) =>
    setAccountAction({ type: "delete", accountId, accountLabel });

  const openReconnectDialog = (accountId: string, accountLabel: string) =>
    setAccountAction({ type: "reconnect", accountId, accountLabel });

  const openRenameDialog = (accountId: string, accountLabel: string) => {
    setRenameValue(accountLabel);
    setAccountAction({ type: "rename", accountId, accountLabel });
  };

  const confirmArchiveAccount = async () => {
    if (!accountAction) return;
    const { accountId } = accountAction;
    try {
      await disconnectAccount.mutateAsync(accountId);
      closeAccountAction();
    } catch (err) {
      console.error("Failed to archive account", err);
      toast.error("Failed to archive account.");
    }
  };

  const confirmReconnectAccount = async () => {
    if (!accountAction) return;
    const { accountId } = accountAction;
    try {
      await unarchiveAccount.mutateAsync(accountId);
      toast.success("Account reconnected.");
      closeAccountAction();
    } catch (err) {
      console.error("Failed to reconnect account", err);
      toast.error("Failed to reconnect account.");
    }
  };

  const confirmDeleteAccount = async () => {
    if (!accountAction) return;
    const { accountId } = accountAction;
    try {
      await deleteAccount.mutateAsync(accountId);
      toast.success("Account deleted.");
      closeAccountAction();
    } catch (err) {
      console.error("Failed to delete account", err);
      toast.error("Failed to delete account.");
    }
  };

  const confirmRenameAccount = async () => {
    if (!accountAction) return;
    const newName = renameValue.trim();
    if (!newName) return;
    try {
      await updateAccount.mutateAsync({
        accountId: accountAction.accountId,
        displayName: newName,
      });
      closeAccountAction();
    } catch (err) {
      console.error("Rename failed", err);
      toast.error("Failed to rename account display name.");
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

  const getSyncStatusDetail = (account: (typeof accounts)[number]) => {
    if (account.import_method === "csv_upload") return null;
    const syncStatus = getAccountSyncStatus(account);
    if (syncStatus.code !== "ready") return syncStatus.detail;
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
              className="flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover cursor-pointer shrink-0 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Add new account
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
          /* Accounts card grid */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => {
              const isSyncing = activeSyncingId === account.id;
              const accountLabel = account.display_name || "MT5 Trading Account";
              const syncStatus = getAccountSyncStatus(account);
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
              const isCsv = account.import_method === "csv_upload";
              const isArchived = account.is_archived;

              const isLive = account.account_type === "live";
              const statusTone = needsAttention
                ? "danger"
                : syncStatus.severity === "pending"
                  ? "pending"
                  : "ok";

              return (
                <Card
                  key={account.id}
                  className={cn(
                    "group relative z-0 flex flex-col gap-0 rounded-2xl border border-border-secondary/70 bg-card-bg shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-all duration-200 hover:z-10 hover:border-border-secondary hover:shadow-[0_4px_16px_-6px_rgba(15,23,42,0.12)]",
                    isArchived && "opacity-60 grayscale hover:opacity-100",
                  )}
                >
                  <CardContent className="flex flex-1 flex-col gap-5 p-5">
                    {/* Header: avatar + name/server, type badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative shrink-0">
                          <Image
                            src={isCsv ? "/brand/images.png" : "/brand/mt5.jpeg"}
                            alt={isCsv ? "CSV import" : "MT5"}
                            width={44}
                            height={44}
                            className="h-11 w-11 object-contain mix-blend-multiply dark:mix-blend-screen"
                          />
                          {/* Status dot */}
                          <span
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card-bg",
                              statusTone === "ok" && "bg-kpi-metric-positive",
                              statusTone === "pending" && "bg-info",
                              statusTone === "danger" && "bg-danger",
                            )}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-text-primary">
                            {accountLabel}
                          </h3>
                          <p className="truncate text-xs font-medium text-text-secondary">
                            {account.broker_login}
                          </p>
                          <p className="truncate text-xs font-medium text-text-tertiary">
                            {account.broker_server}
                          </p>
                        </div>
                      </div>
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-bg-tertiary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isArchived
                              ? "bg-text-tertiary"
                              : statusTone === "ok"
                                ? "bg-kpi-metric-positive"
                                : statusTone === "pending"
                                  ? "bg-info"
                                  : "bg-danger",
                          )}
                        />
                        {isArchived ? "Archived" : isLive ? "Auto-sync" : "Demo"}
                      </span>
                    </div>

                    {/* Balance — the hero metric */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                        Balance
                      </p>
                      <p className="mt-1 text-[28px] font-semibold leading-none tracking-tight text-text-primary tabular-nums">
                        {balanceText}
                      </p>
                      {!isArchived && isCsv && (
                        <button
                          type="button"
                          onClick={() => openCSVReimportModal(account.id)}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border-secondary px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add trades
                        </button>
                      )}
                    </div>

                    {/* Footer: sync status (left) + actions (right) */}
                    <div className="mt-auto flex items-end justify-between gap-2 border-t border-border-secondary/50 pt-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            isArchived
                              ? "bg-text-tertiary"
                              : statusTone === "ok"
                                ? "bg-kpi-metric-positive"
                                : statusTone === "pending"
                                  ? "bg-info"
                                  : "bg-danger",
                          )}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-text-secondary">
                            {isArchived
                              ? "Archived — syncing paused"
                              : isCsv
                                ? `Last import: ${formatLastSync(account.last_synced_at)}`
                                : formatLastSync(account.last_synced_at)}
                          </p>
                          {syncStatusDetail ? (
                            <p className="truncate text-[11px] font-medium text-text-tertiary">
                              {syncStatusDetail}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-0.5">
                        {isArchived ? (
                          <IconAction
                            icon={PlugZap}
                            label="Reconnect account"
                            onClick={() => openReconnectDialog(account.id, accountLabel)}
                            disabled={unarchiveAccount.isPending}
                          />
                        ) : isCsv ? (
                          <IconAction
                            icon={Upload}
                            label="Import more trades"
                            onClick={() => openCSVReimportModal(account.id)}
                          />
                        ) : (
                          <IconAction
                            icon={RefreshCw}
                            label="Sync account trades"
                            onClick={() => handleSyncAccount(account.id)}
                            disabled={isSyncing}
                            iconClassName={isSyncing ? "animate-spin text-text-primary" : undefined}
                          />
                        )}

                        <IconAction
                          icon={Pencil}
                          label="Edit display name"
                          disabled={updateAccount.isPending}
                          onClick={() => openRenameDialog(account.id, accountLabel)}
                        />

                        {!isArchived && (
                          <IconAction
                            icon={Archive}
                            label="Archive (stops syncing, keeps history)"
                            onClick={() => openArchiveDialog(account.id, accountLabel)}
                            disabled={disconnectAccount.isPending}
                          />
                        )}

                        <IconAction
                          icon={Trash2}
                          label="Delete permanently"
                          onClick={() => openDeleteDialog(account.id, accountLabel)}
                          disabled={deleteAccount.isPending}
                          className="hover:bg-danger/10 hover:text-danger"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AccountActionDialog
        action={accountAction}
        renameValue={renameValue}
        onRenameChange={setRenameValue}
        onClose={closeAccountAction}
        onConfirmArchive={confirmArchiveAccount}
        onConfirmDelete={confirmDeleteAccount}
        onConfirmRename={confirmRenameAccount}
        onConfirmReconnect={confirmReconnectAccount}
        archiving={disconnectAccount.isPending}
        deleting={deleteAccount.isPending}
        renaming={updateAccount.isPending}
        reconnecting={unarchiveAccount.isPending}
      />
    </div>
  );
}

function AccountActionDialog({
  action,
  renameValue,
  onRenameChange,
  onClose,
  onConfirmArchive,
  onConfirmDelete,
  onConfirmRename,
  onConfirmReconnect,
  archiving,
  deleting,
  renaming,
  reconnecting,
}: {
  action: {
    type: "archive" | "delete" | "rename" | "reconnect";
    accountId: string;
    accountLabel: string;
  } | null;
  renameValue: string;
  onRenameChange: (value: string) => void;
  onClose: () => void;
  onConfirmArchive: () => void;
  onConfirmDelete: () => void;
  onConfirmRename: () => void;
  onConfirmReconnect: () => void;
  archiving: boolean;
  deleting: boolean;
  renaming: boolean;
  reconnecting: boolean;
}) {
  const open = action !== null;
  const label = action?.accountLabel ?? "";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border border-border-secondary bg-card-bg sm:max-w-md">
        {action?.type === "rename" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onConfirmRename();
            }}
          >
            <DialogHeader>
              <DialogTitle>Rename account</DialogTitle>
              <DialogDescription>
                Choose a new display name for this account.
              </DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              placeholder="Display name"
              className="mt-4 h-11 bg-bg-input"
            />
            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={renaming || !renameValue.trim()}
              >
                {renaming ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        ) : action?.type === "reconnect" ? (
          <>
            <DialogHeader>
              <DialogTitle>Reconnect “{label}”?</DialogTitle>
              <DialogDescription>
                This brings the account back and resumes syncing. Your existing
                trade history is kept.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirmReconnect}
                disabled={reconnecting}
              >
                {reconnecting ? "Reconnecting…" : "Reconnect account"}
              </Button>
            </DialogFooter>
          </>
        ) : action?.type === "archive" ? (
          <>
            <DialogHeader>
              <DialogTitle>Archive “{label}”?</DialogTitle>
              <DialogDescription>
                This stops syncing new trades but keeps your existing trade
                history. You can reconnect it later.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirmArchive}
                disabled={archiving}
              >
                {archiving ? "Archiving…" : "Archive account"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Permanently delete “{label}”?</DialogTitle>
              <DialogDescription>
                This will delete the account and ALL of its trades and journals.
                This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirmDelete}
                disabled={deleting}
                className="bg-danger text-white hover:bg-danger/90"
              >
                {deleting ? "Deleting…" : "Delete permanently"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
