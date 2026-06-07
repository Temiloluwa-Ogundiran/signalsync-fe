import { Metadata } from "next";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

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

  if (session?.accessToken) {
    redirect("/journal");
  }

  return (
    <Card className="w-full max-w-md border-0 sm:border border-border/50 bg-background/60 sm:bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xl shadow-border/5">
      <CardHeader className="space-y-3 pb-6 text-center">
        <div className="flex justify-center pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome to TradePartna
        </CardTitle>
        <CardDescription className="text-sm">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pb-8">
        <LoginForm
          initialEmail={params.email ?? ""}
          justRegistered={params.registered === "1"}
        />
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:text-primary/90 underline-offset-4 hover:underline transition-all"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
