"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
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

export function TraderAccessDialog({
  open,
  accountLabel,
  busy,
  error,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  accountLabel: string;
  busy: boolean;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setPassword("");
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="border border-border-secondary bg-card-bg sm:max-w-md">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (password.trim()) await onSubmit(password);
          }}
        >
          <DialogHeader>
            <div className="mb-2 flex size-9 items-center justify-center rounded-md bg-bg-tertiary text-text-primary">
              <KeyRound className="size-4" />
            </div>
            <DialogTitle>Enable full account access</DialogTitle>
            <DialogDescription>
              Enter the MT5 master password for {accountLabel}. Your existing
              investor password remains available for journal imports.
            </DialogDescription>
          </DialogHeader>
          <label className="mt-5 grid gap-1.5 text-sm">
            <span className="font-medium text-text-primary">
              MT5 master password
            </span>
            <Input
              autoFocus
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter the master password"
              className="h-11 bg-bg-input"
            />
          </label>
          <p className="mt-2 text-xs leading-5 text-text-secondary">
            SignalSync verifies that this password can place trades before
            saving it.
          </p>
          {error ? (
            <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !password.trim()}>
              {busy ? "Verifying..." : "Enable full access"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
