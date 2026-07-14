"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CopyRoutePreview } from "../types";
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
  const [sample, setSample] = useState("");
  const [preview, setPreview] = useState<CopyRoutePreview>();
  const [previewing, setPreviewing] = useState(false);

  const testSignal = async () => {
    if (!route || !sample.trim()) return;
    setPreviewing(true);
    try {
      setPreview(await actions.previewRoute(route.id, sample.trim()));
    } catch (error) {
      toast.error("Signal test could not be completed", { description: apiError(error) });
    } finally {
      setPreviewing(false);
    }
  };

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
      {route ? (
        <section className="mt-5 border-t border-border-primary pt-5" aria-labelledby="route-test-title">
          <div className="flex items-start gap-2">
            <FlaskConical aria-hidden="true" className="mt-0.5 size-4 text-text-secondary" />
            <div>
              <h3 id="route-test-title" className="text-sm font-semibold text-text-primary">Test a channel message</h3>
              <p className="mt-1 text-xs leading-5 text-text-secondary">See how this route interprets a message. This never places a trade.</p>
            </div>
          </div>
          <Textarea className="mt-3 min-h-28" value={sample} onChange={(event) => setSample(event.target.value)} placeholder={"SELL EURUSD\nSL 1.14500\nTP 1.1300"} aria-label="Signal message to test" />
          <div className="mt-3 flex justify-end">
            <Button type="button" variant="outline" disabled={!sample.trim() || previewing} onClick={testSignal}>
              <FlaskConical aria-hidden="true" className="size-4" />
              {previewing ? "Testing..." : "Test Message"}
            </Button>
          </div>
          {preview ? (
            <div className={`mt-3 border-l-2 px-3 py-2 text-sm ${preview.accepted ? "border-success" : "border-warning"}`} role="status">
              <p className="font-semibold text-text-primary">{preview.accepted ? "Ready for broker checks" : "Would not place a trade"}</p>
              <p className="mt-1 text-text-secondary">
                {preview.reason ?? `${preview.direction?.toUpperCase() ?? "Action"} ${preview.broker_symbol ?? preview.signal_symbol ?? "trade"}${preview.volume ? ` at ${preview.volume} lots` : ""}`}
              </p>
              {preview.warnings.map((warning) => <p key={warning} className="mt-1 text-xs text-text-tertiary">{warning}</p>)}
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
