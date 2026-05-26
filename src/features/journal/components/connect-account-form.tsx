"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, PlugZap } from "lucide-react";
import * as z from "zod";
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
import { useConnectJournalAccount } from "../hooks/use-journal-accounts";
import type { JournalAccount, JournalAccountConnectFormValues } from "../types";

const connectAccountSchema = z.object({
  broker_login: z.string().min(1, "Account ID is required").max(64),
  broker_server: z.string().min(1, "Broker server is required").max(120),
  investor_password: z
    .string()
    .min(1, "Investor password is required")
    .max(255),
  platform: z.literal("MT5"),
  display_name: z.string().max(120).optional(),
});

function getBrowserTimezone() {
  if (typeof window === "undefined") {
    return "UTC";
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

import { ConnectAccountProgress } from "./connect-account-progress";

interface ConnectAccountFormProps {
  onSuccess?: (account: JournalAccount) => void;
}

export function ConnectAccountForm({ onSuccess }: ConnectAccountFormProps) {
  const timezone = useMemo(() => getBrowserTimezone(), []);
  const connectAccount = useConnectJournalAccount();

  const form = useForm<JournalAccountConnectFormValues>({
    resolver: zodResolver(connectAccountSchema),
    defaultValues: {
      broker_login: "",
      broker_server: "",
      investor_password: "",
      platform: "MT5",
      display_name: "",
    },
  });

  const isPending = connectAccount.isPending;

  const onSubmit = async (values: JournalAccountConnectFormValues) => {
    form.clearErrors("root");

    const payload = {
      ...values,
      display_name: values.display_name?.trim() || undefined,
      timezone,
    };

    try {
      const account = await connectAccount.mutateAsync(payload);
      toast.success("Account added", {
        description:
          "Credentials verified and history sync completed successfully.",
      });
      onSuccess?.(account);
    } catch (error) {
      form.setValue("investor_password", "");
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect account. Please verify your details.";

      form.setError("root", {
        message,
      });
    }
  };

  if (isPending) {
    return <ConnectAccountProgress />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="broker_login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="For example: 12345678"
                    autoComplete="off"
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
            name="broker_server"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Broker Server</FormLabel>
                <FormControl>
                  <Input
                    placeholder="For example: ICMarketsSC-Demo"
                    autoComplete="off"
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
            name="investor_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Investor Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Read-only password"
                    autoComplete="current-password"
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
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-border-primary bg-bg-input px-3 py-2 text-sm ring-offset-bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                  >
                    <option value="MT5">MT5</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="For example: My main account"
                    autoComplete="off"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="rounded-xl border border-border-primary bg-bg-tertiary/50 px-3 py-2.5 text-xs text-text-secondary">
            Timezone auto-detected:{" "}
            <span className="font-semibold text-text-primary">{timezone}</span>
          </div>
        </div>

        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting Account...
            </>
          ) : (
            <>
              <PlugZap className="mr-2 h-4 w-4" />
              Connect
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
