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
import { useChangeEmail } from "../hooks/use-settings";
import { errorDetail } from "../lib/error-detail";

const schema = z.object({
  new_email: z.string().email({ message: "Enter a valid email address." }),
  current_password: z.string().min(1, { message: "Enter your current password." }),
});

type FormValues = z.infer<typeof schema>;

export function ChangeEmailCard({ currentEmail }: { currentEmail: string }) {
  const changeEmail = useChangeEmail();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { new_email: "", current_password: "" },
  });

  async function onSubmit(values: FormValues) {
    if (values.new_email.trim().toLowerCase() === currentEmail.toLowerCase()) {
      form.setError("new_email", {
        message: "That is already your email address.",
      });
      return;
    }
    try {
      const res = await changeEmail.mutateAsync({
        new_email: values.new_email.trim(),
        current_password: values.current_password,
      });
      toast.success("Email updated", { description: res.message });
      form.reset();
    } catch (err) {
      const message = errorDetail(err, "Could not change email.");
      if (/current password/i.test(message)) {
        form.setError("current_password", { message });
      } else if (/email/i.test(message)) {
        form.setError("new_email", { message });
      } else {
        form.setError("root", { message });
      }
    }
  }

  return (
    <Card className="border-border-secondary bg-card-bg shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Email address</CardTitle>
        <CardDescription>
          Your current email is{" "}
          <span className="font-medium text-text-primary">{currentEmail}</span>.
          Changing it requires verifying the new address and signing in again.
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
              name="new_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={changeEmail.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      disabled={changeEmail.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={changeEmail.isPending}>
                {changeEmail.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Update email
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
