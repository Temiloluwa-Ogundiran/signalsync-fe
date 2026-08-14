"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { resendVerificationEmail } from "../api/auth.api";
import { ApiException } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emailSchema = z.string().email("Enter a valid email address.");
const RESEND_COOLDOWN_SECONDS = 60;

export function ResendVerificationForm({
  initialEmail = "",
  lockedEmail = false,
}: {
  initialEmail?: string;
  lockedEmail?: boolean;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Tick the cooldown down to 0, then re-enable the button.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cooldown > 0 || isPending) return;

    const parsedEmail = emailSchema.safeParse(email.trim());

    if (!parsedEmail.success) {
      setError(parsedEmail.error.issues[0]?.message ?? "Enter a valid email.");
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const result = await resendVerificationEmail(parsedEmail.data);
      toast.success("Verification email sent", {
        description: result.message,
      });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const message =
        err instanceof ApiException
          ? err.message
          : "We couldn't send a new verification email right now.";
      setError(message);
      toast.error("Unable to resend verification email", {
        description: message,
      });
    } finally {
      setIsPending(false);
    }
  }

  const disabled = isPending || cooldown > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {lockedEmail ? (
        <div className="rounded-md border border-border-primary bg-bg-secondary px-3 py-2.5">
          <p className="text-xs font-medium text-text-tertiary">Verification email</p>
          <p className="mt-0.5 truncate text-sm font-medium text-text-primary">{email}</p>
        </div>
      ) : (
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          disabled={isPending}
          autoComplete="email"
        />
      )}
      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={disabled}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : cooldown > 0 ? (
          `Resend in ${cooldown}s`
        ) : (
          "Resend verification email"
        )}
      </Button>
    </form>
  );
}
