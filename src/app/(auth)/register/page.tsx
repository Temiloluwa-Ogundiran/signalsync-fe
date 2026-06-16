import { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/features/auth/components/register-form";
import { hasUsableSession } from "@/lib/auth/auth-session";

export const metadata: Metadata = {
  title: "Create an Account | TradePartna",
  description: "Join TradePartna today",
};

export default async function RegisterPage() {
  const session = await auth();

  if (hasUsableSession(session)) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full">
      <div className="space-y-2 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Create your account
        </h1>
        <p className="text-sm text-text-secondary">
          Enter your information below to get started.
        </p>
      </div>

      <RegisterForm />

      <p className="mt-8 text-center text-sm text-text-secondary">
        Already have an account?{" "}
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
