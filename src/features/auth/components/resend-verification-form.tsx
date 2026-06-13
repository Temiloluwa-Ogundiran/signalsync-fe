"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { resendVerificationEmail } from "../api/auth.api";
import { ApiException } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emailSchema = z.string().email("Enter a valid email address.");

export function ResendVerificationForm({
  initialEmail = "",
}: {
  initialEmail?: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="name@example.com"
        disabled={isPending}
      />
      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Resend verification email"
        )}
      </Button>
    </form>
  );
}
