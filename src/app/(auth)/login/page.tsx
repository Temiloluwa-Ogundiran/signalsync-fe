import { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
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
          Enter your email and password to access your account.
        </p>
      </div>

      <LoginForm
        initialEmail={params.email ?? ""}
        justRegistered={params.registered === "1"}
      />

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
