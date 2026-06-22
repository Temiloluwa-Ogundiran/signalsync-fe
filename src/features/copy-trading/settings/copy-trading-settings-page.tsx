"use client";

import {
  Plus,
  RefreshCw,
  Smartphone,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type {
  CopyAccountPolicy,
  CopyTargetAccount,
  TelegramConnection,
  TelegramSource,
} from "../types";
import {
  useCopyTradingActions,
  useUpdateCopyAccountPolicy,
} from "../hooks";
import { accountLabel, apiError, connectionName, relativeTime } from "../utils";
import { StatusLabel } from "../shared/status-label";
import { ChannelPicker } from "../setup/channel-picker";
import { ChannelAnalysisStep } from "../setup/channel-analysis-step";
import { TelegramSignInDialog } from "../setup/telegram-sign-in-dialog";
import { ConfirmActionDialog } from "../shared/confirm-action-dialog";

export function CopyTradingSettingsPage({
  connections,
  sources,
  accounts,
  policies,
}: {
  connections: TelegramConnection[];
  sources: TelegramSource[];
  accounts: CopyTargetAccount[];
  policies: CopyAccountPolicy[];
}) {
  const actions = useCopyTradingActions();
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [channelOpen, setChannelOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<
    | { kind: "connection"; id: string; label: string }
    | { kind: "source"; id: string; label: string }
    | null
  >(null);

  const run = async (
    action: () => Promise<unknown>,
    success: string,
    failure: string,
  ) => {
    try {
      await action();
      toast.success(success);
    } catch (error) {
      toast.error(failure, { description: apiError(error) });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Copy Trading Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage signal access and account-level safeguards.
        </p>
      </div>

      <SettingsSection
        title="Telegram accounts"
        description="Read-only sessions used to receive channel messages."
        action={
          <Button variant="outline" onClick={() => setTelegramOpen(true)}>
            <Plus className="size-4" />
            Connect Telegram
          </Button>
        }
      >
        {connections.length ? (
          connections.map((connection) => (
            <div
              key={connection.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center"
            >
              <Smartphone className="size-4 shrink-0 text-text-secondary" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-text-primary">
                    {connectionName(connection)}
                  </p>
                  <StatusLabel
                    state={
                      connection.is_paused ? "paused" : connection.state
                    }
                  />
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  {connection.last_heartbeat_at
                    ? `Last checked ${relativeTime(connection.last_heartbeat_at)}`
                    : "Waiting for the first connection check"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-secondary">
                  {connection.is_paused ? "Resume reading" : "Pause reading"}
                </span>
                <Switch
                  checked={!connection.is_paused}
                  onCheckedChange={(enabled) =>
                    run(
                      () =>
                        actions.pauseConnection.mutateAsync({
                          id: connection.id,
                          paused: !enabled,
                        }),
                      enabled
                        ? "Telegram reading resumed"
                        : "Telegram reading paused",
                      "Telegram setting could not be changed",
                    )
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Disconnect ${connectionName(connection)}`}
                  title="Disconnect Telegram"
                  onClick={() =>
                    setConfirmation({
                      kind: "connection",
                      id: connection.id,
                      label: connectionName(connection),
                    })
                  }
                >
                  <Trash2 className="size-4 text-danger" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="px-4 py-8 text-center text-sm text-text-secondary">
            No Telegram account is connected.
          </p>
        )}
      </SettingsSection>

      <SettingsSection
        title="Signal channels"
        description="Channels and groups that TradePartna can read for trade instructions."
        action={
          <Button variant="outline" onClick={() => setChannelOpen(true)}>
            <Plus className="size-4" />
            Add signal channel
          </Button>
        }
      >
        {sources.length ? (
          sources.map((source) => (
            <div key={source.id} className="px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-text-primary">
                      {source.title}
                    </p>
                    <StatusLabel
                      state={source.is_paused ? "paused" : source.state}
                    />
                  </div>
                  <p className="mt-1 text-xs capitalize text-text-secondary">
                    {source.source_type}
                    {source.profile
                      ? ` | ${source.profile.signal_style} | ${source.profile.confidence} confidence`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      run(
                        () => actions.relearnSource.mutateAsync(source.id),
                        "Channel analysis started",
                        "Channel analysis could not start",
                      )
                    }
                  >
                    <RefreshCw className="size-4" />
                    Analyze again
                  </Button>
                  <Switch
                    checked={!source.is_paused}
                    onCheckedChange={(enabled) =>
                      run(
                        () =>
                          actions.pauseSource.mutateAsync({
                            id: source.id,
                            paused: !enabled,
                          }),
                        enabled
                          ? "Signal channel resumed"
                          : "Signal channel paused",
                        "Signal channel could not be changed",
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${source.title}`}
                    title="Remove signal channel"
                    onClick={() =>
                      setConfirmation({
                        kind: "source",
                        id: source.id,
                        label: source.title,
                      })
                    }
                  >
                    <Trash2 className="size-4 text-danger" />
                  </Button>
                </div>
              </div>
              {source.profile?.confidence === "low" ? (
                <p className="mt-3 rounded-md bg-warning/5 px-3 py-2 text-sm text-warning-text">
                  This channel changes format often. Copying remains available;
                  review its activity more closely.
                </p>
              ) : null}
              {[
                "learning",
                "failed_retryable",
                "unsupported",
                "unsupported_image_primary",
              ].includes(source.state) ? (
                <div className="mt-3">
                  <ChannelAnalysisStep source={source} />
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p className="px-4 py-8 text-center text-sm text-text-secondary">
            No signal channel has been added.
          </p>
        )}
      </SettingsSection>

      <SettingsSection
        title="Trading accounts"
        description="Maximum trade size and account-level copy pauses."
      >
        {accounts.map((account) => (
          <TradingAccountRow
            key={`${account.id}:${policies.find((item) => item.account_id === account.id)?.updated_at ?? "new"}`}
            account={account}
            policy={policies.find((item) => item.account_id === account.id)}
          />
        ))}
      </SettingsSection>

      <TelegramSignInDialog
        open={telegramOpen}
        onOpenChange={setTelegramOpen}
      />
      <ChannelPicker
        open={channelOpen}
        onOpenChange={setChannelOpen}
        connections={connections}
        sources={sources}
      />
      <ConfirmActionDialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
        title={
          confirmation?.kind === "connection"
            ? "Disconnect Telegram?"
            : "Remove signal channel?"
        }
        description={
          confirmation?.kind === "connection"
            ? `TradePartna will stop reading every channel through ${confirmation.label}. Existing broker trades are not changed.`
            : `${confirmation?.label ?? "This channel"} will stop feeding every copy rule that uses it. Existing broker trades are not changed.`
        }
        confirmLabel={
          confirmation?.kind === "connection" ? "Disconnect" : "Remove channel"
        }
        onConfirm={async () => {
          if (!confirmation) return;
          await run(
            () =>
              confirmation.kind === "connection"
                ? actions.disconnect.mutateAsync(confirmation.id)
                : actions.deleteSource.mutateAsync(confirmation.id),
            confirmation.kind === "connection"
              ? "Telegram disconnected"
              : "Signal channel removed",
            confirmation.kind === "connection"
              ? "Telegram could not be disconnected"
              : "Signal channel could not be removed",
          );
        }}
      />
    </div>
  );
}

function SettingsSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border-primary bg-card-bg">
      <div className="flex flex-col gap-3 border-b border-border-primary px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-text-primary">{title}</h2>
          <p className="mt-0.5 text-sm text-text-secondary">{description}</p>
        </div>
        {action}
      </div>
      <div className="divide-y divide-border-primary">{children}</div>
    </section>
  );
}

function TradingAccountRow({
  account,
  policy,
}: {
  account: CopyTargetAccount;
  policy?: CopyAccountPolicy;
}) {
  const updatePolicy = useUpdateCopyAccountPolicy();
  const [maxLot, setMaxLot] = useState(policy?.max_lot ?? "100");
  const [enabled, setEnabled] = useState(!policy?.is_paused);
  const save = async () => {
    try {
      await updatePolicy.mutateAsync({
        accountId: account.id,
        payload: { max_lot: maxLot, is_paused: !enabled },
      });
      toast.success("Trading account safeguards saved");
    } catch (error) {
      toast.error("Trading account safeguards could not be saved", {
        description: apiError(error),
      });
    }
  };
  return (
    <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-end">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-text-primary">
            {accountLabel(account, account.id)}
          </p>
          <StatusLabel state={account.connection_state} />
        </div>
        <p className="mt-1 text-xs text-text-secondary">
          {account.broker_server || account.broker_name}
        </p>
      </div>
      <label className="grid gap-1.5 text-sm lg:w-48">
        <span className="font-medium text-text-primary">
          Maximum trade size
        </span>
        <Input
          type="number"
          min="0.01"
          step="0.01"
          value={maxLot}
          onChange={(event) => setMaxLot(event.target.value)}
        />
      </label>
      <div className="flex h-9 items-center gap-2">
        <Switch checked={enabled} onCheckedChange={setEnabled} />
        <span className="text-sm text-text-secondary">
          {enabled ? "Copying enabled" : "Copying paused"}
        </span>
      </div>
      <Button
        variant="outline"
        onClick={save}
        disabled={updatePolicy.isPending || Number(maxLot) <= 0}
      >
        {updatePolicy.isPending ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
