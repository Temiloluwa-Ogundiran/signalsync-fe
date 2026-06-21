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
  CopyTargetAccount,
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
  accounts: CopyTargetAccount[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{route ? "Edit copy rule" : "New copy rule"}</DialogTitle>
          <DialogDescription>
            Choose where signals come from, where trades go, and how they are
            managed.
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
  accounts: CopyTargetAccount[];
  onSaved: () => void;
}) {
  const actions = useCopyTradingActions();
  const readySources = sources.filter(
    (item) => item.profile && item.state !== "unsupported",
  );
  const readyAccounts = accounts.filter(
    (item) => item.connection_state === "ready",
  );
  const [value, setValue] = useState<CopyRouteInput>(() =>
    route
      ? routeInput(route)
      : {
          ...defaultCopyPreferences,
          source_id: readySources[0]?.id ?? "",
          target_account_id: readyAccounts[0]?.id ?? "",
          assembly_window_seconds:
            readySources[0]?.profile?.recommended_assembly_window_seconds ??
            90,
        },
  );

  const save = async () => {
    try {
      if (route) {
        await actions.updateRoute.mutateAsync({
          id: route.id,
          payload: value,
        });
        toast.success("Copy rule updated");
      } else {
        await actions.createRoute.mutateAsync(value);
        toast.success("Copy rule created");
      }
      onSaved();
    } catch (error) {
      toast.error("Copy rule could not be saved", {
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
                const source = sources.find((item) => item.id === sourceId);
                setValue((current) => ({
                  ...current,
                  source_id: sourceId,
                  assembly_window_seconds:
                    source?.profile?.recommended_assembly_window_seconds ??
                    current.assembly_window_seconds,
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
              value={value.target_account_id}
              disabled={Boolean(route)}
              onChange={(targetAccountId) =>
                setValue((current) => ({
                  ...current,
                  target_account_id: targetAccountId,
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
          submitLabel="Save copy rule"
        />
    </>
  );
}
