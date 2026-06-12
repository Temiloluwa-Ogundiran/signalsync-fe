import { Metadata } from "next";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | TradePartna",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md border-0 sm:border border-border/50 bg-background/60 sm:bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xl shadow-border/5">
      <CardHeader className="space-y-3 pb-6 text-center">
        <div className="flex justify-center pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Forgot your password?
        </CardTitle>
        <CardDescription className="text-sm">
          Enter your email address and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pb-8">
        <ForgotPasswordForm />
        <div className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary/90 underline-offset-4 hover:underline transition-all"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
