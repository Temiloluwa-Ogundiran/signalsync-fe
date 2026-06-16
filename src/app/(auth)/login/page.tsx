import { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
import { hasUsableSession } from "@/lib/auth/auth-session";

export const metadata: Metadata = {
  title: "Login | TradePartna",
  description: "Login to your account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ registered?: string; email?: string }>;
}) {
  const session = await auth();
  const params = (await searchParams) ?? {};

  if (hasUsableSession(session)) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full">
      <div className="space-y-2 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Welcome back
        </h1>
        <p className="text-sm text-text-secondary">
          Sign in to pick up where you left off.
        </p>
      </div>

      <LoginForm
        initialEmail={params.email ?? ""}
        justRegistered={params.registered === "1"}
      />

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border-primary" />
        <span className="text-xs font-medium text-text-tertiary">OR</span>
        <span className="h-px flex-1 bg-border-primary" />
      </div>

      <GoogleSignInButton />

      <p className="mt-8 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-ai-accent underline-offset-4 transition-colors hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
