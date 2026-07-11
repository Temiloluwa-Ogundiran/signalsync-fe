import { Metadata } from "next";
import { Suspense } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { AuthCardShell } from "@/features/auth/components/auth-card-shell";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your account",
};

export default function ResetPasswordPage() {
  return (
    <AuthCardShell>
    <div className="rounded-2xl border border-border-secondary/70 bg-white p-8 shadow-sm sm:p-10">
      <h2 className="text-center text-lg font-bold text-text-primary">
        Reset Password
      </h2>

      <div className="my-6 flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-auth-accent/10 text-auth-accent">
          <KeyRound className="h-7 w-7" />
        </span>
        <h1 className="text-xl font-bold text-text-primary">
          Reset Your Password
        </h1>
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
    </div>
    </AuthCardShell>
  );
}
