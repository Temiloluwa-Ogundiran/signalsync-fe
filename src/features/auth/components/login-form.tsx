"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { refreshAuthSensitiveQueries } from "../lib/auth-query-state";

const UNVERIFIED_MESSAGE = "Please verify your email before logging in.";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "You are not allowed to sign in.",
};

function getAuthErrorMessage(error?: string | null, code?: string | null) {
  if (!error) {
    return "Unable to sign in. Please try again.";
  }

  if (error === "CredentialsSignin") {
    if (code && code !== "credentials") {
      return code;
    }

    return "Incorrect email or password.";
  }

  return AUTH_ERROR_MESSAGES[error] ?? "Unable to sign in. Please try again.";
}

export function LoginForm({
  initialEmail = "",
  justRegistered = false,
}: {
  initialEmail?: string;
  justRegistered?: boolean;
}) {
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: initialEmail,
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsPending(true);
    form.clearErrors("root");
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        form.setError("root", {
          message: getAuthErrorMessage(result.error, result.code),
        });
        return;
      }

      if (!result?.ok) {
        form.setError("root", { message: "Unable to sign in. Please try again." });
        return;
      }

      refreshAuthSensitiveQueries(queryClient);
      router.replace("/dashboard");
      router.refresh();
    } catch {
      form.setError("root", { message: "Something went wrong." });
    } finally {
      setIsPending(false);
    }
  }

  const rootError = form.formState.errors.root?.message;
  const isUnverified = rootError === UNVERIFIED_MESSAGE;
  const resendUrl = `/resend-verification?email=${encodeURIComponent(form.getValues("email"))}`;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {justRegistered ? (
          <div className="rounded-xl border border-success/25 bg-success-light px-4 py-3 text-sm text-success">
            Your account was created. Verify your email, then sign in here.
            <div className="mt-1 text-success/90">
              Didn&apos;t get an email?{" "}
              <Link
                href={resendUrl}
                className="font-medium underline underline-offset-4 hover:text-success"
              >
                Resend verification email
              </Link>
            </div>
          </div>
        ) : null}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    {...field}
                    disabled={isPending}
                    className="focus-visible:ring-auth-accent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-auth-accent transition-colors hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      {...field}
                      disabled={isPending}
                      className="focus-visible:ring-auth-accent"
                    />
                  </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff
                          className="h-4 w-4 text-text-secondary"
                          aria-hidden="true"
                        />
                      ) : (
                        <Eye
                          className="h-4 w-4 text-text-secondary"
                          aria-hidden="true"
                        />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {rootError ? (
          <div>
            <p className="text-sm font-medium text-destructive">{rootError}</p>
            {isUnverified ? (
              <p className="mt-1 text-sm text-muted-foreground">
                <Link
                  href={resendUrl}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Resend verification email
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
        <Button
          className="h-11 w-full cursor-pointer bg-auth-accent text-white hover:bg-auth-accent-hover focus-visible:ring-auth-accent/40"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </Form>
  );
}
