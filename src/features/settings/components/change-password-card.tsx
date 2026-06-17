"use client";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PASSWORD_POLICY_MESSAGE,
  registerPasswordSchema,
} from "@/lib/validation/password-policy";
import { useChangePassword } from "../hooks/use-settings";
import { errorDetail } from "../lib/error-detail";

const schema = z
  .object({
    current_password: z.string().min(1, { message: "Enter your current password." }),
    new_password: registerPasswordSchema,
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((d) => d.new_password !== d.current_password, {
    message: "New password must be different from your current one.",
    path: ["new_password"],
  });

type FormValues = z.infer<typeof schema>;

export function ChangePasswordCard() {
  const changePassword = useChangePassword();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await changePassword.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      toast.success("Password changed", {
        description: "Your other sessions have been signed out.",
      });
      form.reset();
    } catch (err) {
      const message = errorDetail(err, "Could not change password.");
      // Surface a wrong-current-password error on the right field.
      if (/current password/i.test(message)) {
        form.setError("current_password", { message });
      } else {
        form.setError("root", { message });
      }
    }
  }

  return (
    <Card className="border-border-secondary bg-card-bg shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Password</CardTitle>
        <CardDescription>
          Changing your password signs you out of all other devices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                      disabled={changePassword.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                      disabled={changePassword.isPending}
                    />
                  </FormControl>
                  <p className="text-xs text-text-secondary">
                    {PASSWORD_POLICY_MESSAGE}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                      disabled={changePassword.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Update password
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
