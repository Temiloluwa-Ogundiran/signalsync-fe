"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check, ChevronsUpDown, Loader2, PlugZap, Search } from "lucide-react";
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
import {
  useConnectJournalAccount,
  useMt5ServerSearch,
} from "../hooks/use-journal-accounts";
import { sanitizeJournalConnectionError } from "../lib/sanitize-connection-error";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
      onSuccess?.(account);
    } catch (error) {
      form.setValue("investor_password", "");
      const message =
        sanitizeJournalConnectionError(
          error instanceof Error ? error.message : null,
        ) ??
        (error instanceof Error
          ? error.message
          : "Unable to connect account. Please verify your details.");
      const title = /timed?\s*out|timeout/i.test(message)
        ? "MT5 verification timed out"
        : "Account authorization failed";

      toast.error(title, {
        description: message,
      });

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
                  <Mt5ServerCombobox
                    value={field.value}
                    onChange={(serverName) => {
                      field.onChange(serverName);
                      form.clearErrors("broker_server");
                    }}
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

function Mt5ServerCombobox({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [searchValue]);

  const { data: servers = [], isFetching } = useMt5ServerSearch(
    debouncedSearchValue,
    open,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-10 w-full justify-between border-border-primary bg-bg-input px-3 text-left font-normal text-text-primary hover:bg-bg-input",
            !value && "text-text-tertiary",
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {value || "Search and select your MT5 server"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 text-text-tertiary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] border-border-primary bg-card-bg p-0 text-text-primary shadow-xl"
      >
        <div className="flex items-center gap-2 border-b border-border-primary px-3 py-2">
          <Search className="h-4 w-4 text-text-tertiary" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Type server name..."
            className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {isFetching && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching servers...
            </div>
          )}

          {!isFetching && servers.length === 0 && (
            <div className="px-3 py-3 text-sm text-text-secondary">
              No MT5 server found.
            </div>
          )}

          {!isFetching &&
            servers.map((server) => {
              const isSelected = server.server_name === value;
              return (
                <button
                  key={server.server_name}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-bg-secondary",
                    isSelected && "bg-bg-secondary text-text-primary",
                  )}
                  onClick={() => {
                    onChange(server.server_name);
                    setSearchValue(server.server_name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 text-ai-accent",
                      !isSelected && "opacity-0",
                    )}
                  />
                  <span className="truncate">{server.server_name}</span>
                </button>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
