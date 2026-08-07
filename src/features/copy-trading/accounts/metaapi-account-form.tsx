"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
import { useCopyTradingActions } from "../hooks";
import { apiError } from "../utils";
import { Field } from "../shared/form-controls";
import type { CopyTradingConnection } from "../types";

export function MetaApiAccountForm({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (connection: CopyTradingConnection) => void;
}) {
  const actions = useCopyTradingActions();
  const [displayName, setDisplayName] = useState("");
  const [login, setLogin] = useState("");
  const [server, setServer] = useState("");
  const [password, setPassword] = useState("");
  const valid = displayName.trim() && /^\d+$/.test(login) && server.trim() && password;

  const submit = async () => {
    try {
      const connection = await actions.createCopyConnection.mutateAsync({
        display_name: displayName.trim(),
        broker_login: login,
        broker_server: server.trim(),
        trader_password: password,
        platform: "mt5",
      });
      onCreated?.(connection);
      setPassword("");
      onOpenChange(false);
      toast.success("Copy account connection started", {
        description: "You can leave this page. Setup will continue automatically.",
      });
    } catch (error) {
      toast.error("Copy account could not be connected", {
        description: apiError(error),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect copy account</DialogTitle>
          <DialogDescription>
            Use the MT5 master password for the account that will receive copied trades. Investor passwords cannot place trades.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Account name">
            <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Primary copy account" />
          </Field>
          <Field label="MT5 login">
            <Input inputMode="numeric" value={login} onChange={(event) => setLogin(event.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Broker server">
            <Input value={server} onChange={(event) => setServer(event.target.value)} placeholder="Broker-MT5-Demo" />
          </Field>
          <Field label="MT5 master password">
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="Enter the master password" />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!valid || actions.createCopyConnection.isPending} onClick={submit}>
            {actions.createCopyConnection.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {actions.createCopyConnection.isPending ? "Starting connection..." : "Connect account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
