"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/features/auth/api/auth.api";
import { ApiException } from "@/lib/api/types";
import { ResendVerificationForm } from "@/features/auth/components/resend-verification-form";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(!!token);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token || verifiedRef.current) return;
    verifiedRef.current = true;

    verifyEmail(token)
      .then((data) => {
        setMessage(data.message || "Your email has been successfully verified.");
      })
      .catch((err) => {
        setError(
          err instanceof ApiException
            ? err.message
            : "The verification link is invalid or has expired."
        );
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center pb-2">
            <XCircle className="h-12 w-12 text-danger" />
          </div>
          <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
          <CardDescription>
            No verification token was provided in the URL.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">Return to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center pb-2">
          {isLoading ? (
            <Loader2 className="h-12 w-12 text-accent animate-spin" />
          ) : error ? (
            <XCircle className="h-12 w-12 text-danger" />
          ) : (
            <CheckCircle2 className="h-12 w-12 text-success" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold">
          {isLoading
            ? "Verifying Email..."
            : error
            ? "Verification Failed"
            : "Email Verified!"}
        </CardTitle>
        <CardDescription>
          {isLoading
            ? "Please wait while we verify your email address securely."
            : error
            ? error
            : message}
        </CardDescription>
      </CardHeader>
      {!isLoading && (
        <CardFooter>
          <div className="w-full space-y-4">
            {error ? (
              <ResendVerificationForm />
            ) : null}
            <Button asChild className="w-full">
              <Link href="/login">
                Continue to Login <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center pb-2">
              <Loader2 className="h-12 w-12 text-accent animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
