"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/features/auth/api/auth.api";
import { ApiException } from "@/lib/api/types";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(!!token);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // True once we've started auto-logging the user in (so we show "Signing you
  // in…" and don't flash the manual "Continue to Login" button).
  const [autoLogin, setAutoLogin] = useState(false);
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token || verifiedRef.current) return;
    verifiedRef.current = true;

    verifyEmail(token)
      .then(async (data) => {
        setMessage(data.message || "Your email has been successfully verified.");

        // Fresh verification returns a session — log the user straight in.
        if (data.access_token && data.user) {
          setAutoLogin(true);
          const result = await signIn("credentials", {
            prelogin: JSON.stringify({
              accessToken: data.access_token,
              refreshToken: data.refresh_token ?? "",
              accessTokenExpiryMinutes: data.access_token_expiry_minutes ?? 30,
              user: data.user,
            }),
            redirect: false,
          });
          if (result?.ok) {
            router.replace("/dashboard");
            router.refresh();
            return;
          }
          // Seeding the session failed — fall back to the manual login button.
          setAutoLogin(false);
        }
      })
      .catch((err) => {
        setError(
          err instanceof ApiException
            ? err.message
            : "The verification link is invalid or has expired."
        );
      })
      .finally(() => setIsLoading(false));
  }, [token, router]);

  if (!token) {
    return (
      <div className="w-full text-center">
        <div className="mb-5 flex justify-center">
          <XCircle className="h-12 w-12 text-danger" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Invalid link
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          No verification token was provided in the URL.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/login">Return to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full text-center">
      <div className="mb-5 flex justify-center">
        {isLoading || autoLogin ? (
          <Loader2 className="h-12 w-12 animate-spin text-ai-accent" />
        ) : error ? (
          <XCircle className="h-12 w-12 text-danger" />
        ) : (
          <CheckCircle2 className="h-12 w-12 text-success" />
        )}
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">
        {isLoading
          ? "Verifying email…"
          : error
            ? "Verification failed"
            : autoLogin
              ? "Signing you in…"
              : "Email verified!"}
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        {isLoading
          ? "Please wait while we verify your email address securely."
          : error
            ? error
            : autoLogin
              ? "Your email is verified. Taking you to your dashboard…"
              : message}
      </p>

      {!isLoading && !autoLogin && (
        <div className="mt-6 w-full space-y-3">
          {error ? (
            <Button asChild variant="outline" className="w-full">
              <Link href="/resend-verification">Resend verification email</Link>
            </Button>
          ) : null}
          <Button asChild className="w-full">
            <Link href="/login">
              Continue to login <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full text-center">
          <div className="mb-5 flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-ai-accent" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Loading…
          </h1>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
