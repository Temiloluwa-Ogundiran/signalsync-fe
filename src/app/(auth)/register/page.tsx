import { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/features/auth/components/register-form";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
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

      <RegisterForm />

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
