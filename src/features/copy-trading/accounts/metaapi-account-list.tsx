"use client";

import { useState } from "react";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CopyAccountPolicy, CopyTradingConnection } from "../types";
import { useCopyTradingActions } from "../hooks";
import { accountLabel, apiError } from "../utils";
import { ConfirmActionDialog } from "../shared/confirm-action-dialog";
import { MetaApiAccountStatus } from "./metaapi-account-status";
import { AccountSafetyForm } from "./account-safety-form";

const RETRYABLE = new Set([
  "invalid_credentials",
  "server_not_found",
  "provisioning_failed",
  "broker_disconnected",
  "synchronization_failed",
  "trading_disabled",
]);

export function MetaApiAccountList({
  accounts,
  policies,
}: {
  accounts: CopyTradingConnection[];
  policies: CopyAccountPolicy[];
}) {
  const [removing, setRemoving] = useState<CopyTradingConnection | null>(null);
  const actions = useCopyTradingActions();
  if (!accounts.length) {
    return (
      <p className="px-4 py-8 text-center text-sm text-text-secondary">
        No copy account is connected.
      </p>
    );
  }
  return (
    <>
      {accounts.map((account) => (
        <MetaApiAccountRow
          key={account.id}
          account={account}
          policy={policies.find((item) => item.connection_id === account.id)}
          onRemove={() => setRemoving(account)}
        />
      ))}
      <ConfirmActionDialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoving(null);
        }}
        title="Disconnect copy account?"
        description="Attached copy rules will pause. Existing broker trades are not changed."
        confirmLabel="Disconnect"
        onConfirm={async () => {
          if (!removing) return;
          try {
            await actions.deleteCopyConnection.mutateAsync(removing.id);
            toast.success("Copy account disconnect started");
          } catch (error) {
            toast.error("Copy account could not be disconnected", {
              description: apiError(error),
            });
          }
        }}
      />
    </>
  );
}

function MetaApiAccountRow({
  account,
  policy,
  onRemove,
}: {
  account: CopyTradingConnection;
  policy?: CopyAccountPolicy;
  onRemove: () => void;
}) {
  const actions = useCopyTradingActions();
  const ready = account.state === "ready";
  const retry = async () => {
    try {
      await actions.retryCopyConnection.mutateAsync(account.id);
      toast.success("Connection check restarted", {
        description: "TradePartna will keep this status updated automatically.",
      });
    } catch (error) {
      toast.error("Connection could not be retried", {
        description: apiError(error),
      });
    }
  };
  return (
    <div className="px-4 py-5 sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text-primary">
            {accountLabel(account, account.id)}
          </p>
          <p className="mt-1 break-words text-xs text-text-secondary">
            {account.broker_login} | {account.broker_server}
          </p>
          <div className="mt-2">
            <MetaApiAccountStatus account={account} />
          </div>
        </div>
        {!ready && RETRYABLE.has(account.state) ? (
          <Button
            variant="outline"
            onClick={retry}
            disabled={actions.retryCopyConnection.isPending}
          >
            {actions.retryCopyConnection.isPending ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <RefreshCw aria-hidden="true" className="size-4" />
            )}
            {actions.retryCopyConnection.isPending ? "Retrying..." : "Try again"}
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          title="Disconnect copy account"
          aria-label={`Disconnect ${accountLabel(account, account.id)}`}
          onClick={onRemove}
          disabled={account.state === "deleting" || account.state === "deleted"}
        >
          <Trash2 aria-hidden="true" className="size-4 text-danger" />
        </Button>
      </div>
      {ready && policy ? (
        <AccountSafetyForm
          key={policy.updated_at}
          connectionId={account.id}
          policy={policy}
        />
      ) : ready ? (
        <p className="mt-4 text-sm text-text-secondary" role="status">
          Loading account safety settings...
        </p>
      ) : null}
    </div>
  );
}
