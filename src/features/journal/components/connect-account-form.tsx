"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  PlugZap,
  Search,
  Calendar,
  XCircle,
  CheckCircle2,
} from "lucide-react";
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

const SUPPORTED_ASSETS = [
  { label: "Forex", supported: true },
  { label: "Crypto", supported: true },
];

const LINKING_STEPS = [
  "Select your Broker.",
  "Input your Server. Your server can be found on the MetaTrader 5 login window or from your MetaTrader 5 account creation email.",
  "Input your Username or Account Number. This is your MT5 account number/login (only numbers are allowed).",
  "Input your Investor Password. This is your MetaTrader 5 read-only password.",
];

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
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
      {/* Left column: the form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-5">
            {/* Start date — UI placeholder; not sent to the backend yet. */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Start date
              </label>
              <div className="relative">
                <Input
                  readOnly
                  value="Import all records"
                  className="h-12 cursor-default bg-bg-input pr-10 text-text-secondary"
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              </div>
            </div>

            <FormField
              control={form.control}
              name="broker_login"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-text-primary">
                    Account number <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="For example: 12345678"
                      autoComplete="off"
                      className="h-12 bg-bg-input"
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
                  <FormLabel className="text-sm font-medium text-text-primary">
                    Server <span className="text-danger">*</span>
                  </FormLabel>
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
                  <FormLabel className="text-sm font-medium text-text-primary">
                    Password <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Read-only investor password"
                      autoComplete="current-password"
                      className="h-12 bg-bg-input"
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
              <span className="font-semibold text-text-primary">
                {timezone}
              </span>
            </div>
          </div>

          {form.formState.errors.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button
            className="h-12 w-full text-sm font-semibold"
            type="submit"
            disabled={isPending}
          >
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

      {/* Right column: platform info panel */}
      <aside className="space-y-6 md:border-l md:border-border-secondary md:pl-12">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/mt5.jpeg"
            alt="MetaTrader 5"
            width={40}
            height={40}
            className="h-10 w-10 object-contain mix-blend-multiply dark:mix-blend-screen"
          />
          <h3 className="text-2xl font-bold tracking-tight text-text-primary">
            MetaTrader 5
          </h3>
          <span className="rounded-md bg-info px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            New
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold text-text-primary">
            Supported Asset Types:
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {SUPPORTED_ASSETS.map((asset) => (
              <span
                key={asset.label}
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm",
                  asset.supported
                    ? "font-medium text-text-primary"
                    : "text-text-tertiary",
                )}
              >
                {asset.supported ? (
                  <CheckCircle2 className="h-4 w-4 text-kpi-metric-positive" />
                ) : (
                  <XCircle className="h-4 w-4 text-text-tertiary" />
                )}
                {asset.label}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold text-text-primary">
            Linking MetaTrader 5
          </p>
          <ol className="space-y-3">
            {LINKING_STEPS.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-secondary">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-text-tertiary" />
                <span className="leading-relaxed">
                  {i + 1}. {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
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

  const tooShort = debouncedSearchValue.trim().length < 4;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-12 w-full justify-between border-border-primary bg-bg-input px-3 text-left font-normal text-text-primary hover:bg-bg-input",
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
          {tooShort && !isFetching && (
            <div className="px-3 py-3 text-sm text-text-secondary">
              Start typing (at least 4 symbols) to see available servers
            </div>
          )}

          {!tooShort && isFetching && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching servers...
            </div>
          )}

          {!tooShort && !isFetching && servers.length === 0 && (
            <div className="px-3 py-3 text-sm text-text-secondary">
              No MT5 server found.
            </div>
          )}

          {!tooShort &&
            !isFetching &&
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
