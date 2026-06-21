"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCopyTradingActions } from "./hooks";
import type {
  CopyRoute,
  CopyTargetAccount,
  TelegramSource,
} from "./types";
import { apiError } from "./utils";
import { Field, Select } from "./shared/form-controls";

export function EmergencyActionsDialog({
  open,
  onOpenChange,
  accounts,
  routes,
  sources,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: CopyTargetAccount[];
  routes: CopyRoute[];
  sources: TelegramSource[];
}) {
  const actions = useCopyTradingActions();
  const [scope, setScope] = useState("global");
  const [scopeId, setScopeId] = useState("");
  const [action, setAction] = useState("both");
  const [confirmation, setConfirmation] = useState("");
  const scopeItems =
    scope === "account"
      ? accounts
      : scope === "route"
        ? routes
        : scope === "source"
          ? sources
          : [];
  const unlocked =
    confirmation === "EMERGENCY" &&
    (scope === "global" || Boolean(scopeId));
  const consequence =
    action === "close_positions"
      ? "All matching copied positions in this scope will be closed."
      : action === "cancel_pending"
        ? "All matching copied pending orders in this scope will be cancelled."
        : "All matching copied positions will be closed and copied pending orders cancelled.";

  const execute = async () => {
    try {
      await actions.emergency.mutateAsync({
        action,
        scope,
        scope_id: scope === "global" ? undefined : scopeId,
        confirmation,
      });
      toast.warning("Emergency action started", {
        description: "Broker results will appear in Copy Activity.",
      });
      setConfirmation("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Emergency action could not start", {
        description: apiError(error),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Emergency actions</DialogTitle>
          <DialogDescription>
            These actions affect copied positions and pending orders only.
            Manual trades are never affected.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-3 rounded-md border border-danger/25 bg-danger-light px-3 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
            <p className="text-sm leading-5 text-text-secondary">{consequence}</p>
          </div>
          <Field label="Action">
            <Select value={action} onChange={setAction}>
              <option value="close_positions">Close copied positions</option>
              <option value="cancel_pending">Cancel copied pending orders</option>
              <option value="both">Close positions and cancel orders</option>
            </Select>
          </Field>
          <Field label="Scope">
            <Select
              value={scope}
              onChange={(value) => {
                setScope(value);
                setScopeId("");
              }}
            >
              <option value="global">All copy rules</option>
              <option value="account">One trading account</option>
              <option value="source">One signal channel</option>
              <option value="route">One copy rule</option>
            </Select>
          </Field>
          {scope !== "global" ? (
            <Field label="Apply to">
              <Select value={scopeId} onChange={setScopeId}>
                <option value="">Select an item</option>
                {scopeItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {"title" in item
                      ? item.title
                      : "broker_name" in item
                        ? item.display_name || `${item.broker_name} ${item.broker_login}`
                        : `Copy rule ${item.id.slice(0, 8)}`}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label="Type EMERGENCY to confirm">
            <Input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Type EMERGENCY"
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!unlocked || actions.emergency.isPending}
            onClick={execute}
          >
            {actions.emergency.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Run emergency action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
