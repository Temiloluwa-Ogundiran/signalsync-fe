"use client";

import { Plus, Radio, ShieldCheck, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type {
  CopyAccountPolicy,
  CopyRoute,
  CopyRouteInput,
  CopyTradingConnection,
  TelegramConnection,
  TelegramSource,
} from "../types";
import { useCopyTradingActions } from "../hooks";
import { accountLabel, apiError, connectionName, routeInput } from "../utils";
import { EmptyState } from "../shared/empty-state";
import { StatusLabel } from "../shared/status-label";
import { ChannelPicker } from "./channel-picker";
import {
  defaultCopyPreferences,
  PreferencesStep,
} from "./preferences-step";
import { SetupStep } from "./setup-step";
import { TelegramSignInDialog } from "./telegram-sign-in-dialog";
import { MetaApiAccountForm } from "../accounts/metaapi-account-form";
import { MetaApiAccountStatus } from "../accounts/metaapi-account-status";

export function SetupWorkspace({
  connections,
  sources,
  accounts,
  policies,
  routes,
}: {
  connections: TelegramConnection[];
  sources: TelegramSource[];
  accounts: CopyTradingConnection[];
  policies: CopyAccountPolicy[];
  routes: CopyRoute[];
}) {
  const actions = useCopyTradingActions();
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [channelOpen, setChannelOpen] = useState(false);
  const [copyAccountOpen, setCopyAccountOpen] = useState(false);
  const readyConnection = connections.find(
    (item) => item.state === "ready" && !item.is_paused,
  );
  const [sourceId, setSourceId] = useState(
    routes[0]?.source_id ?? sources[0]?.id ?? "",
  );
  const source = sources.find((item) => item.id === sourceId) ?? sources[0];
  const readyAccounts = accounts.filter((item) => item.state === "ready");
  const [accountId, setAccountId] = useState(
    routes[0]?.target_connection_id ?? readyAccounts[0]?.id ?? "",
  );
  const selectedAccountId = accountId || readyAccounts[0]?.id || "";
  const account = accounts.find((item) => item.id === selectedAccountId);
  const readyAccount = account?.state === "ready" ? account : undefined;

  const existingRoute = routes.find(
    (item) =>
      item.source_id === source?.id &&
      item.target_connection_id === selectedAccountId &&
      item.state !== "active",
  );
  const [preferences, setPreferences] = useState<CopyRouteInput>(() =>
    existingRoute
      ? routeInput(existingRoute)
      : {
          ...defaultCopyPreferences,
          source_id: source?.id ?? "",
          target_connection_id: selectedAccountId,
          assembly_window_seconds: 90,
        },
  );
  const [savedRoute, setSavedRoute] = useState<CopyRoute | null>(
    existingRoute ?? null,
  );
  const currentStep = !readyConnection
    ? 1
    : !source
      ? 2
      : !readyAccount
        ? 3
        : !savedRoute
          ? 4
          : 5;

  const stepState = (step: number) =>
    step < currentStep
      ? ("complete" as const)
      : step === currentStep
        ? ("current" as const)
        : ("upcoming" as const);

  const savePreferences = async () => {
    if (!source || !account) return;
    const payload = {
      ...preferences,
      source_id: source.id,
      target_connection_id: account.id,
    };
    try {
      const route = existingRoute
        ? await actions.updateRoute.mutateAsync({
            id: existingRoute.id,
            payload,
          })
        : await actions.createRoute.mutateAsync(payload);
      setSavedRoute(route);
      toast.success("Copy rule saved");
    } catch (error) {
      toast.error("Could not save this copy rule", {
        description: apiError(error),
      });
    }
  };

  const activate = async () => {
    if (!savedRoute) return;
    try {
      await actions.routeAction.mutateAsync({
        id: savedRoute.id,
        action: "activate",
      });
      toast.success("Copying started");
    } catch (error) {
      toast.error("Copying could not start", {
        description: apiError(error),
      });
    }
  };

  const selectedPolicy = policies.find(
    (item) => item.connection_id === account?.id,
  );
  const review = useMemo(
    () => [
      ["Trade size", `${Number(preferences.fixed_lot).toFixed(2)} lots`],
      [
        "Take profits",
        preferences.take_profit_mode === "all"
          ? "One position per take profit"
          : preferences.take_profit_mode === "lowest"
            ? "Nearest take profit"
            : "Furthest take profit",
      ],
      [
        "Pending orders",
        preferences.pending_orders_enabled ? "Allowed" : "Ignored",
      ],
      [
        "Group messages",
        preferences.process_all_group_authors
          ? "All members"
          : "Administrators only",
      ],
      [
        "Entry policy",
        preferences.minimum_fields === "direction_symbol"
          ? "Enter immediately without SL or TP"
          : preferences.minimum_fields === "direction_symbol_sl"
            ? "Wait for stop loss"
            : preferences.minimum_fields === "direction_symbol_tp"
              ? "Wait for take profit"
              : preferences.minimum_fields === "direction_symbol_entry"
                ? "Wait for entry price"
                : "Wait for stop loss and take profit",
      ],
      ...(preferences.minimum_fields === "direction_symbol"
        ? []
        : [
            [
              "Waiting time",
              `${preferences.assembly_window_seconds ?? 90} seconds`,
            ],
          ]),
    ],
    [preferences],
  );

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase text-text-tertiary">
            Guided setup
          </p>
          <h1 className="mt-1 text-xl font-bold text-text-primary">
            Start copying Telegram signals
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Complete each step once. You can return and change the copy rule
            later.
          </p>
        </div>

        <SetupStep
          number={1}
          title="Connect Telegram"
          description="Connect the Telegram account that receives your trading signals."
          state={stepState(1)}
          summary={
            readyConnection
              ? `Telegram connected as ${connectionName(readyConnection)}`
              : undefined
          }
        >
          <div className="space-y-4">
            <p className="text-sm leading-6 text-text-secondary">
              TradePartna uses a read-only session. It can read channels you
              select but cannot send messages or change your Telegram account.
            </p>
            <Button onClick={() => setTelegramOpen(true)}>
              <Smartphone className="size-4" />
              Connect Telegram
            </Button>
          </div>
        </SetupStep>

        <SetupStep
          number={2}
          title="Choose a signal channel"
          description="Select the channel or group whose trade instructions you want to copy."
          state={stepState(2)}
          summary={source ? `${source.title} selected` : undefined}
        >
          {sources.length ? (
            <div className="space-y-3">
              <div className="grid gap-2">
                {sources.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSourceId(item.id);
                      setSavedRoute(null);
                      setPreferences((current) => ({
                        ...current,
                        source_id: item.id,
                      }));
                    }}
                    className={`flex items-center justify-between rounded-md border px-3 py-3 text-left ${
                      source?.id === item.id
                        ? "border-border-secondary bg-bg-tertiary"
                        : "border-border-primary"
                    }`}
                  >
                    <span>
                      <span className="block font-medium text-text-primary">
                        {item.title}
                      </span>
                      <span className="text-xs capitalize text-text-secondary">
                        {item.source_type}
                      </span>
                    </span>
                    <StatusLabel state={item.state} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              compact
              icon={Radio}
              title="Choose your first signal channel"
              body="Search the live channels and groups joined by your Telegram account."
              action={
                <Button onClick={() => setChannelOpen(true)}>
                  Choose channel
                </Button>
              }
            />
          )}
        </SetupStep>

        <SetupStep
          number={3}
          title="Choose where trades should be copied"
          description="Select an independent MT5 connection used for copy execution."
          state={stepState(3)}
          summary={account ? accountLabel(account, account.id) : undefined}
        >
          <div className="grid gap-2">
            {accounts.map((item) => {
              const policy = policies.find(
                (candidate) => candidate.connection_id === item.id,
              );
              const available = item.state === "ready" && !policy?.is_paused;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    setAccountId(item.id);
                    setSavedRoute(null);
                    setPreferences((current) => ({
                      ...current,
                      target_connection_id: item.id,
                    }));
                  }}
                  className={`flex items-center justify-between gap-4 rounded-md border px-3 py-3 text-left disabled:opacity-50 ${
                    selectedAccountId === item.id
                      ? "border-border-secondary bg-bg-tertiary"
                      : "border-border-primary"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-text-primary">
                      {accountLabel(item, item.id)}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {item.broker_login} · {item.broker_server}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <StatusLabel state={available ? "ready" : item.state} />
                  </span>
                </button>
              );
            })}
            {account && account.state !== "ready" ? (
              <div className="border-l-2 border-accent/50 py-1 pl-3">
                <MetaApiAccountStatus account={account} />
              </div>
            ) : null}
            {!accounts.some((item) => item.state !== "deleted") ? (
              <Button variant="outline" onClick={() => setCopyAccountOpen(true)}>
                <Plus className="size-4" />
                Connect copy account
              </Button>
            ) : null}
          </div>
        </SetupStep>

        <SetupStep
          number={4}
          title="Set your copying preferences"
          description="Choose trade size, take-profit behavior and trade-management permissions."
          state={stepState(4)}
          summary={`${Number(preferences.fixed_lot).toFixed(2)} lots`}
        >
          <PreferencesStep
            value={preferences}
            onChange={setPreferences}
            onContinue={savePreferences}
            busy={
              actions.createRoute.isPending || actions.updateRoute.isPending
            }
          />
        </SetupStep>

        <SetupStep
          number={5}
          title="Start copying"
          description="Review your choices, then activate this copy rule."
          state={stepState(5)}
        >
          <div className="space-y-5">
            <div>
              <p className="text-lg font-semibold text-text-primary">
                {source?.title} to {accountLabel(account, selectedAccountId)}
              </p>
              {selectedPolicy?.is_paused ? (
                <p className="mt-1 text-sm text-warning-text">
                  Copying to this account is currently paused in Settings.
                </p>
              ) : null}
            </div>
            <dl className="divide-y divide-border-primary rounded-md border border-border-primary">
              {review.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm"
                >
                  <dt className="text-text-secondary">{label}</dt>
                  <dd className="text-right font-medium text-text-primary">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <Button
              onClick={activate}
              disabled={
                actions.routeAction.isPending || selectedPolicy?.is_paused
              }
            >
              <ShieldCheck className="size-4" />
              {actions.routeAction.isPending
                ? "Starting..."
                : "Start copying"}
            </Button>
          </div>
        </SetupStep>
      </div>

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
      <MetaApiAccountForm
        open={copyAccountOpen}
        onOpenChange={setCopyAccountOpen}
        onCreated={(connection) => {
          setAccountId(connection.id);
          setPreferences((current) => ({
            ...current,
            target_connection_id: connection.id,
          }));
        }}
      />
    </>
  );
}
