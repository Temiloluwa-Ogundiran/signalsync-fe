"use client";

import { Plus, RefreshCw, Smartphone, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type {
  CopyAccountPolicy,
  CopyTradingConnection,
  TelegramConnection,
  TelegramSource,
} from "../types";
import { useCopyTradingActions } from "../hooks";
import { apiError, connectionName, relativeTime } from "../utils";
import { StatusLabel } from "../shared/status-label";
import { ChannelPicker } from "../setup/channel-picker";
import { TelegramSignInDialog } from "../setup/telegram-sign-in-dialog";
import { ConfirmActionDialog } from "../shared/confirm-action-dialog";
import { MetaApiAccountForm } from "../accounts/metaapi-account-form";
import { MetaApiAccountList } from "../accounts/metaapi-account-list";

export function CopyTradingSettingsPage({
  connections,
  sources,
  accounts,
  policies,
}: {
  connections: TelegramConnection[];
  sources: TelegramSource[];
  accounts: CopyTradingConnection[];
  policies: CopyAccountPolicy[];
}) {
  const actions = useCopyTradingActions();
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [telegramReconnectId, setTelegramReconnectId] = useState<string | null>(
    null,
  );
  const [channelOpen, setChannelOpen] = useState(false);
  const [copyAccountOpen, setCopyAccountOpen] = useState(false);
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
          Connections & Safety
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Connect Telegram and trading accounts, then choose how much risk each
          account can take.
        </p>
      </div>

      <SettingsSection
        title="Telegram Connections"
        description="TradePartna reads signals from these Telegram accounts. It never sends messages."
        action={
          <Button
            variant="outline"
            onClick={() => {
              setTelegramReconnectId(null);
              setTelegramOpen(true);
            }}
          >
            <Plus className="size-4" />
            {connections.length
              ? "Connect another Telegram"
              : "Connect Telegram"}
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
                    state={connection.is_paused ? "paused" : connection.state}
                  />
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  {connection.state === "reauthentication_required"
                    ? "Telegram must be reconnected before new signals can be copied."
                    : connection.state === "disconnected"
                    ? "Connection interrupted. TradePartna is reconnecting automatically."
                    : connection.last_heartbeat_at
                    ? `Last checked ${relativeTime(connection.last_heartbeat_at)}`
                    : "Waiting for the first connection check"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {connection.state === "reauthentication_required" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTelegramReconnectId(connection.id);
                      setTelegramOpen(true);
                    }}
                  >
                    <RefreshCw className="size-4" />
                    Reconnect Telegram
                  </Button>
                ) : (
                  <>
                    <span className="text-xs text-text-secondary">
                      {connection.is_paused ? "Resume reading" : "Pause reading"}
                    </span>
                    <Switch
                      aria-label={`${connection.is_paused ? "Resume" : "Pause"} Telegram reading for ${connectionName(connection)}`}
                      checked={!connection.is_paused}
                      disabled={actions.pauseConnection.isPending}
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
                  </>
                )}
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
        title="Signal Channels"
        description="Only messages from these channels and groups can become copy instructions."
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
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    aria-label={`${source.is_paused ? "Resume" : "Pause"} signal channel ${source.title}`}
                    checked={!source.is_paused}
                    disabled={actions.pauseSource.isPending}
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
            </div>
          ))
        ) : (
          <p className="px-4 py-8 text-center text-sm text-text-secondary">
            No signal channel has been added.
          </p>
        )}
      </SettingsSection>

      <SettingsSection
        title="Trading Accounts & Risk Limits"
        description="Trades are placed through MetaApi. Each account has its own independent safety limits."
        action={
          <Button variant="outline" onClick={() => setCopyAccountOpen(true)}>
            <Plus className="size-4" />
            Connect copy account
          </Button>
        }
      >
        <MetaApiAccountList accounts={accounts} policies={policies} />
      </SettingsSection>

      <MetaApiAccountForm
        open={copyAccountOpen}
        onOpenChange={setCopyAccountOpen}
      />

      <TelegramSignInDialog
        open={telegramOpen}
        reconnect={telegramReconnectId !== null}
        reconnectConnectionId={telegramReconnectId ?? undefined}
        onOpenChange={(open) => {
          setTelegramOpen(open);
          if (!open) setTelegramReconnectId(null);
        }}
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
