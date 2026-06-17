"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteAccount } from "../hooks/use-settings";
import { errorDetail } from "../lib/error-detail";

export function DeleteAccountCard() {
  const deleteAccount = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setError(null);
    if (!password) {
      setError("Enter your password to confirm.");
      return;
    }
    try {
      await deleteAccount.mutateAsync({ current_password: password });
      toast.success("Your account has been deleted.");
      // The backend revoked all sessions; clear the local session and leave.
      await signOut({ callbackUrl: "/login", redirect: true });
    } catch (err) {
      setError(errorDetail(err, "Could not delete account."));
    }
  }

  return (
    <Card className="border-destructive/40 bg-card-bg shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-destructive">Delete account</CardTitle>
        <CardDescription>
          Permanently close your account. Your data is deactivated and you&apos;ll
          be signed out everywhere. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            setPassword("");
            setError(null);
            setOpen(true);
          }}
        >
          Delete my account
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={(v) => !deleteAccount.isPending && setOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This deactivates your account and signs you out on all devices.
              Enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-confirm-password">Password</Label>
            <Input
              id="delete-confirm-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={deleteAccount.isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter") onConfirm();
              }}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleteAccount.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
