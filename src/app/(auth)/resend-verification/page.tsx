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
import { ResendVerificationForm } from "@/features/auth/components/resend-verification-form";

export const metadata: Metadata = {
  title: "Resend Verification Email | TradePartna",
  description: "Resend your email verification link",
};

export default async function ResendVerificationPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string }>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <Card className="w-full max-w-md border-0 sm:border border-border/50 bg-background/60 sm:bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xl shadow-border/5">
      <CardHeader className="space-y-3 pb-6 text-center">
        <div className="flex justify-center pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Resend verification email
        </CardTitle>
        <CardDescription className="text-sm">
          Enter your email address and we&apos;ll send a fresh verification link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pb-8">
        <ResendVerificationForm initialEmail={params.email ?? ""} />
        <div className="text-center text-sm text-muted-foreground">
          Already verified?{" "}
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
