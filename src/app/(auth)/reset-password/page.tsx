import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | TradePartna",
  description: "Set a new password for your account",
};

export default function ResetPasswordPage() {
  return (
    <div className="w-full">
      <div className="space-y-2 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Set a new password
        </h1>
        <p className="text-sm text-text-secondary">
          Choose a strong password for your account.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-text-tertiary" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Back to{" "}
        <Link
          href="/login"
          className="font-semibold text-ai-accent underline-offset-4 transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
