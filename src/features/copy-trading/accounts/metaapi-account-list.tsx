"use client";

import { useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { CopyAccountPolicy, CopyTradingConnection } from "../types";
import { useCopyTradingActions, useUpdateCopyAccountPolicy } from "../hooks";
import { accountLabel, apiError } from "../utils";
import { ConfirmActionDialog } from "../shared/confirm-action-dialog";
import { MetaApiAccountStatus } from "./metaapi-account-status";

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
    return <p className="px-4 py-8 text-center text-sm text-text-secondary">No copy account is connected.</p>;
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
        onOpenChange={(open) => { if (!open) setRemoving(null); }}
        title="Disconnect copy account?"
        description="Attached copy rules will pause. Existing broker trades are not changed."
        confirmLabel="Disconnect"
        onConfirm={async () => {
          if (!removing) return;
          try {
            await actions.deleteCopyConnection.mutateAsync(removing.id);
            toast.success("Copy account disconnect started");
          } catch (error) {
            toast.error("Copy account could not be disconnected", { description: apiError(error) });
          }
        }}
      />
    </>
  );
}

function MetaApiAccountRow({ account, policy, onRemove }: { account: CopyTradingConnection; policy?: CopyAccountPolicy; onRemove: () => void }) {
  const actions = useCopyTradingActions();
  const updatePolicy = useUpdateCopyAccountPolicy();
  const [maxLot, setMaxLot] = useState(policy?.max_lot ?? "100");
  const [enabled, setEnabled] = useState(!policy?.is_paused);
  const ready = account.state === "ready";
  const save = async () => {
    try {
      await updatePolicy.mutateAsync({ connectionId: account.id, payload: { max_lot: maxLot, is_paused: !enabled } });
      toast.success("Copy account safeguards saved");
    } catch (error) {
      toast.error("Safeguards could not be saved", { description: apiError(error) });
    }
  };
  return (
    <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-end">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-text-primary">{accountLabel(account, account.id)}</p>
        <p className="mt-1 text-xs text-text-secondary">{account.broker_login} · {account.broker_server}</p>
        <div className="mt-2"><MetaApiAccountStatus account={account} /></div>
      </div>
      {ready ? (
        <>
          <label className="grid gap-1.5 text-sm lg:w-44">
            <span className="font-medium text-text-primary">Maximum trade size</span>
            <Input type="number" min="0.01" step="0.01" value={maxLot} onChange={(event) => setMaxLot(event.target.value)} />
          </label>
          <div className="flex h-9 items-center gap-2"><Switch checked={enabled} onCheckedChange={setEnabled} /><span className="text-sm text-text-secondary">{enabled ? "Enabled" : "Paused"}</span></div>
          <Button variant="outline" onClick={save} disabled={updatePolicy.isPending || Number(maxLot) <= 0}>Save</Button>
        </>
      ) : RETRYABLE.has(account.state) ? (
        <Button variant="outline" onClick={() => actions.retryCopyConnection.mutate(account.id)} disabled={actions.retryCopyConnection.isPending}><RefreshCw className="size-4" />Retry</Button>
      ) : null}
      <Button variant="ghost" size="icon-sm" title="Disconnect copy account" aria-label={`Disconnect ${accountLabel(account, account.id)}`} onClick={onRemove} disabled={account.state === "deleting" || account.state === "deleted"}><Trash2 className="size-4 text-danger" /></Button>
    </div>
  );
}
