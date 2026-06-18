"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { RegisterForm } from "./register-form";
import { GoogleSignInButton } from "./google-sign-in-button";
import { resendVerificationEmail } from "../api/auth.api";

/**
 * The sign-up card. On success it swaps the whole card to a "check your email"
 * confirmation (no redirect to login) — the user verifies via the emailed link,
 * which signs them in and lands them in the app.
 */
export function RegisterCard() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  async function handleResend() {
    if (!sentTo || resending) return;
    setResending(true);
    try {
      await resendVerificationEmail(sentTo);
      toast.success("Verification email resent", {
        description: `We sent another link to ${sentTo}.`,
      });
    } catch {
      toast.error("Couldn't resend", { description: "Please try again." });
    } finally {
      setResending(false);
    }
  }

  if (sentTo) {
    return (
      <div className="rounded-2xl border border-border-secondary/70 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-auth-accent/10 text-auth-accent">
          <MailCheck className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          Check your email
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          We sent a verification link to{" "}
          <span className="font-semibold text-text-primary">{sentTo}</span>.
          Click it to activate your account — you&apos;ll be signed in
          automatically.
        </p>
        <p className="mt-6 text-sm text-text-secondary">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-auth-accent transition-colors hover:underline disabled:opacity-60"
          >
            {resending ? "Resending…" : "Resend email"}
          </button>
        </p>
        <p className="mt-6 text-sm text-text-secondary">
          <Link
            href="/login"
            className="font-semibold text-auth-accent transition-colors hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-secondary/70 bg-white p-8 shadow-sm sm:p-10">
      {/* Logo mark + heading */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Image
          src="/brand/tradepartna-mark.svg"
          alt="TradePartna"
          width={56}
          height={47}
          priority
          className="h-12 w-auto"
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Create your account
          </h1>
          <p className="text-sm text-text-secondary">
            Enter your information below to get started.
          </p>
        </div>
      </div>

      <RegisterForm onSuccess={setSentTo} />

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border-secondary" />
        <span className="text-xs text-text-tertiary">Or continue with</span>
        <span className="h-px flex-1 bg-border-secondary" />
      </div>

      <GoogleSignInButton />

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-auth-accent transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
