"use client";

import { useEffect, useState } from "react";
import { Loader2, QrCode, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCopyTradingActions, useTelegramConnections } from "../hooks";
import type { TelegramAuth } from "../types";
import { apiError } from "../utils";
import { Field } from "../shared/form-controls";

export function TelegramSignInDialog({
  open,
  reconnect = false,
  reconnectConnectionId,
  onOpenChange,
}: {
  open: boolean;
  reconnect?: boolean;
  reconnectConnectionId?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const actions = useCopyTradingActions();
  const { refetch: refetchConnections } = useTelegramConnections();
  // Phone sign-in is the primary flow. QR remains available as a fallback.
  const [method, setMethod] = useState<"phone" | "qr">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState<TelegramAuth | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth || ["ready", "failed"].includes(auth.state)) return;
    const timer = window.setInterval(async () => {
      try {
        const next = await actions.getAuth(auth.auth_id);
        setAuth(next);
        if (next.state === "ready") {
          toast.success("Telegram connected");
          setMethod("phone");
          onOpenChange(false);
        } else if (next.state === "failed") {
          toast.error(next.message);
        }
      } catch (error) {
        window.clearInterval(timer);
        if (reconnectConnectionId) {
          const latest = await refetchConnections();
          const reconnected = latest.data?.some(
            (connection) =>
              connection.id === reconnectConnectionId &&
              connection.state === "ready",
          );
          if (reconnected) {
            toast.success("Telegram connected");
            setMethod("phone");
            onOpenChange(false);
            return;
          }
        }
        setAuth((current) =>
          current
            ? {
                ...current,
                state: "failed",
                message: "Telegram sign-in could not be confirmed. Try again.",
              }
            : current,
        );
        toast.error("Could not confirm Telegram sign-in", {
          description: apiError(error),
        });
      }
    }, 1200);
    return () => window.clearInterval(timer);
  }, [
    actions,
    auth,
    onOpenChange,
    refetchConnections,
    reconnectConnectionId,
  ]);

  const start = async () => {
    try {
      setAuth(
        method === "phone"
          ? await actions.startPhone.mutateAsync(phone)
          : await actions.startQr.mutateAsync(),
      );
    } catch (error) {
      toast.error("Could not connect Telegram", {
        description: apiError(error),
      });
    }
  };

  const submitCode = async () => {
    if (!auth) return;
    setSubmitting(true);
    try {
      setAuth(await actions.submitCode(auth.auth_id, code));
    } catch (error) {
      toast.error("Telegram code could not be verified", {
        description: apiError(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitPassword = async () => {
    if (!auth) return;
    setSubmitting(true);
    try {
      setAuth(await actions.submitPassword(auth.auth_id, password));
    } catch (error) {
      toast.error("Telegram password could not be verified", {
        description: apiError(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const changeOpen = (value: boolean) => {
    if (!value) {
      setAuth(null);
      setCode("");
      setPassword("");
      setMethod("phone");
    }
    onOpenChange(value);
  };

  const changeMethod = (nextMethod: "phone" | "qr") => {
    setMethod(nextMethod);
    if (auth) {
      setAuth(null);
      setCode("");
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {reconnect ? "Reconnect Telegram" : "Connect Telegram"}
          </DialogTitle>
          <DialogDescription>
            {reconnect
              ? "Sign in again to resume reading signals from your existing channels."
              : "Connect the account that receives your trading signals."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-1 rounded-md bg-bg-tertiary p-1">
          <Button
            variant={method === "phone" ? "secondary" : "ghost"}
            onClick={() => changeMethod("phone")}
          >
            <Smartphone className="size-4" />
            Phone number
          </Button>
          <Button
            variant={method === "qr" ? "secondary" : "ghost"}
            onClick={() => changeMethod("qr")}
          >
            <QrCode className="size-4" />
            QR code
          </Button>
        </div>
        {!auth ? (
          <div className="space-y-4">
            {method === "phone" ? (
              <Field label="Telegram phone number">
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+234..."
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </Field>
            ) : (
              <p className="rounded-md border border-border-primary bg-bg-tertiary px-3 py-3 text-sm leading-6 text-text-secondary">
                Open Telegram on your phone, then go to Settings, Devices, and
                Link Desktop Device.
              </p>
            )}
            <Button
              className="w-full"
              onClick={start}
              disabled={
                (method === "phone" && phone.length < 7) ||
                actions.startPhone.isPending ||
                actions.startQr.isPending
              }
            >
              {actions.startPhone.isPending || actions.startQr.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {actions.startPhone.isPending || actions.startQr.isPending
                ? "Connecting to Telegram..."
                : method === "qr"
                  ? "Connect with QR code"
                  : "Use phone number"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border border-border-primary bg-bg-tertiary p-3 text-sm text-text-secondary">
              {!["code_required", "password_required", "failed"].includes(
                auth.state,
              ) ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {auth.message}
            </div>
            {auth.state === "qr_required" && auth.qr_url ? (
              <div className="flex justify-center rounded-md bg-white p-5">
                <QRCodeSVG value={auth.qr_url} size={220} />
              </div>
            ) : null}
            {auth.state === "code_required" ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    aria-label="Telegram login code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Telegram code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                  />
                  <Button
                    className="sm:shrink-0"
                    disabled={code.trim().length < 3 || submitting}
                    onClick={submitCode}
                  >
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                    {submitting ? "Verifying..." : "Verify"}
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs text-text-tertiary">
                  <span>Still no code? QR sign-in does not need one.</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => changeMethod("qr")}
                  >
                    Use QR instead
                  </Button>
                </div>
              </div>
            ) : null}
            {auth.state === "password_required" ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="password"
                  aria-label="Telegram two-step password"
                  autoComplete="current-password"
                  placeholder="Two-step password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <Button className="sm:shrink-0"
                  disabled={!password || submitting}
                  onClick={submitPassword}
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  {submitting ? "Verifying..." : "Verify"}
                </Button>
              </div>
            ) : null}
            {auth.state === "failed" ? (
              <Button className="w-full" onClick={() => setAuth(null)}>
                Try again
              </Button>
            ) : null}
          </div>
        )}
        <p className="text-xs leading-5 text-text-tertiary">
          SignalSync uses a read-only session. It can read channels you select
          but cannot send messages or change your Telegram account. Your
          two-step password is never stored.
        </p>
      </DialogContent>
    </Dialog>
  );
}
