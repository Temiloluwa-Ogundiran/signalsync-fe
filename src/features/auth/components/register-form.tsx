"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  PASSWORD_POLICY_MESSAGE,
  registerPasswordSchema,
} from "@/lib/validation/password-policy";
import { PasswordStrength } from "./password-strength";

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
import { registerAction } from "../actions";

const registerSchema = z.object({
  display_name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Max 100 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: registerPasswordSchema,
});

export function RegisterForm({
  onSuccess,
  referralCode,
}: {
  /** Called with the email once the account is created. */
  onSuccess?: (email: string) => void;
  referralCode?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      display_name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    startTransition(async () => {
      const res = await registerAction({
        ...values,
        referral_code: referralCode,
        referral_source_detail: referralCode ? "affiliate_link" : undefined,
      });
      form.clearErrors("root");

      if (res?.fieldErrors) {
        for (const [field, message] of Object.entries(res.fieldErrors)) {
          form.setError(field as keyof z.infer<typeof registerSchema>, {
            type: "server",
            message,
          });
        }
      }

      if (res?.error && !res?.fieldErrors) {
        form.setError("root", { message: res.error });
      } else if (res?.success) {
        form.reset();
        onSuccess?.(values.email);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    autoComplete="name"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    autoComplete="email"
                    {...field}
                    disabled={isPending}
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...field}
                      disabled={isPending}
                    />
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
                </FormControl>
                <PasswordStrength password={field.value} />
                <p className="text-xs text-text-secondary">
                  {PASSWORD_POLICY_MESSAGE}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button
          className="h-11 w-full cursor-pointer bg-auth-accent text-white hover:bg-auth-accent-hover focus-visible:ring-auth-accent/40"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
}
