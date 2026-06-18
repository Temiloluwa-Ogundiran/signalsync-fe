import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { AuthCardShell } from "@/features/auth/components/auth-card-shell";

export const metadata: Metadata = {
  title: "Forgot Password | TradePartna",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCardShell>
    <div className="rounded-2xl border border-border-secondary/70 bg-white p-8 shadow-sm sm:p-10">
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
            Forgot your password?
          </h1>
          <p className="text-sm text-text-secondary">
            Enter your email address and we&apos;ll send you a reset link.
          </p>
        </div>
      </div>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-text-secondary">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-auth-accent transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
    </AuthCardShell>
  );
}
