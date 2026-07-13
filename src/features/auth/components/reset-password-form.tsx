"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { resetPassword } from "../api/auth.api";
import {
  PASSWORD_POLICY_MESSAGE,
  registerPasswordSchema,
} from "@/lib/validation/password-policy";

const schema = z
  .object({
    password: registerPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    if (!token) {
      form.setError("root", {
        message: "Reset token is missing. Please use the link from your email.",
      });
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(token, values.password);
      toast.success("Password reset successfully. Please log in.");
      router.push("/login");
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Invalid or expired reset link.";
      form.setError("root", { message: detail });
    } finally {
      setIsLoading(false);
    }
  }

  const password = form.watch("password");
  const strength = passwordStrength(password);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="New password"
                  {...field}
                  disabled={isLoading}
                  className="focus-visible:ring-auth-accent"
                />
              </FormControl>
              {password ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={
                          "h-1.5 flex-1 rounded-full transition-colors " +
                          (i < strength.score
                            ? strength.barClass
                            : "bg-border-secondary")
                        }
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">
                      Password strength:
                    </span>
                    <span className={strength.textClass}>{strength.label}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {PASSWORD_POLICY_MESSAGE}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  {...field}
                  disabled={isLoading}
                  className="focus-visible:ring-auth-accent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="h-11 w-full bg-auth-accent text-white hover:bg-auth-accent-hover focus-visible:ring-auth-accent/40"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>
      </form>
    </Form>
  );
}

/** Lightweight 0–4 strength estimate from length + character variety. */
function passwordStrength(pw: string): {
  score: number;
  label: string;
  barClass: string;
  textClass: string;
} {
  if (!pw) return { score: 0, label: "", barClass: "", textClass: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(4, score);
  const meta = [
    { label: "Too short", barClass: "bg-danger", textClass: "text-danger" },
    { label: "Weak", barClass: "bg-danger", textClass: "text-danger" },
    { label: "Fair", barClass: "bg-warning", textClass: "text-warning" },
    {
      label: "Good",
      barClass: "bg-kpi-metric-positive",
      textClass: "text-kpi-metric-positive",
    },
    {
      label: "Strong",
      barClass: "bg-kpi-metric-positive",
      textClass: "text-kpi-metric-positive",
    },
  ][score];
  return { score, ...meta };
}
