import { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | TradePartna",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full">
      <div className="space-y-2 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Forgot your password?
        </h1>
        <p className="text-sm text-text-secondary">
          Enter your email address and we&apos;ll send you a reset link.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="mt-8 text-center text-sm text-text-secondary">
        Remember your password?{" "}
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
