"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  CopyRoute,
  CopyRouteInput,
  CopyTradingConnection,
  TelegramSource,
} from "../types";
import { useCopyTradingActions } from "../hooks";
import { accountLabel, apiError, routeInput } from "../utils";
import { Field, Select } from "../shared/form-controls";
import {
  defaultCopyPreferences,
  PreferencesStep,
} from "../setup/preferences-step";

export function CopyRuleForm({
  open,
  onOpenChange,
  route,
  sources,
  accounts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: CopyRoute;
  sources: TelegramSource[];
  accounts: CopyTradingConnection[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {route ? "Edit Copy Route" : "New Copy Route"}
          </DialogTitle>
          <DialogDescription>
            Choose the Telegram source, destination account, and copying
            behavior.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <CopyRuleFormBody
            key={route?.id ?? "new"}
            route={route}
            sources={sources}
            accounts={accounts}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CopyRuleFormBody({
  route,
  sources,
  accounts,
  onSaved,
}: {
  route?: CopyRoute;
  sources: TelegramSource[];
  accounts: CopyTradingConnection[];
  onSaved: () => void;
}) {
  const actions = useCopyTradingActions();
  const readySources = sources.filter((item) => !item.is_paused);
  const readyAccounts = accounts.filter((item) => item.state === "ready");
  const [value, setValue] = useState<CopyRouteInput>(() =>
    route
      ? routeInput(route)
      : {
          ...defaultCopyPreferences,
          source_id: readySources[0]?.id ?? "",
          target_connection_id: readyAccounts[0]?.id ?? "",
          assembly_window_seconds: 90,
        },
  );

  const save = async () => {
    try {
      if (route) {
        await actions.updateRoute.mutateAsync({
          id: route.id,
          payload: value,
        });
        toast.success("Copy route updated");
      } else {
        await actions.createRoute.mutateAsync(value);
        toast.success("Copy route created");
      }
      onSaved();
    } catch (error) {
      toast.error("Copy route could not be saved", {
        description: apiError(error),
      });
    }
  };

  return (
    <>
      <div className="grid gap-4 border-b border-border-primary pb-5 sm:grid-cols-2">
        <Field label="Signal channel">
          <Select
            value={value.source_id}
            disabled={Boolean(route)}
            onChange={(sourceId) => {
              setValue((current) => ({
                ...current,
                source_id: sourceId,
              }));
            }}
          >
            <option value="">Choose a channel</option>
            {readySources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Trading account">
          <Select
            value={value.target_connection_id}
            disabled={Boolean(route)}
            onChange={(targetAccountId) =>
              setValue((current) => ({
                ...current,
                target_connection_id: targetAccountId,
              }))
            }
          >
            <option value="">Choose an account</option>
            {readyAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {accountLabel(account, account.id)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <PreferencesStep
        value={value}
        onChange={setValue}
        onContinue={save}
        busy={actions.createRoute.isPending || actions.updateRoute.isPending}
        submitLabel="Save Copy Route"
      />
    </>
  );
}
