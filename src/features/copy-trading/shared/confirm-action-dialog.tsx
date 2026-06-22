"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmText,
  busy = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmText?: string;
  busy?: boolean;
  onConfirm: () => Promise<void> | void;
}) {
  const [value, setValue] = useState("");
  const allowed = !confirmText || value === confirmText;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setValue("");
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {confirmText ? (
          <label className="grid gap-2 text-sm text-text-primary">
            <span>
              Type <strong>{confirmText}</strong> to continue.
            </span>
            <Input
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </label>
        ) : null}
        <DialogFooter>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={busy || !allowed}
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
          >
            {busy ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
