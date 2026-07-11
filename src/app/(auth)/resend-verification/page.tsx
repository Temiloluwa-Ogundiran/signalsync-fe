import { Metadata } from "next";
import Link from "next/link";
import { ResendVerificationForm } from "@/features/auth/components/resend-verification-form";
import { AuthCardShell } from "@/features/auth/components/auth-card-shell";

export const metadata: Metadata = {
  title: "Resend Verification Email",
  description: "Resend your email verification link",
};

export default async function ResendVerificationPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string }>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <AuthCardShell>
    <div className="w-full">
      <div className="space-y-2 pb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Resend verification email
        </h1>
        <p className="text-sm text-text-secondary">
          Enter your email address and we&apos;ll send a fresh verification link.
        </p>
      </div>

      <ResendVerificationForm initialEmail={params.email ?? ""} />

      <p className="mt-8 text-center text-sm text-text-secondary">
        Already verified?{" "}
        <Link
          href="/login"
          className="font-semibold text-ai-accent underline-offset-4 transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
    </AuthCardShell>
  );
}
