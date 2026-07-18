"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { AppLoader } from "@/components/app-loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiException } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { useCancelSubscription, useStartCheckout, useSubscription } from "./hooks";
import {
  copyMonthlyPrice,
  planRequest,
  type BillingPlan,
} from "./subscription-pricing";


function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}


function errorDetail(error: unknown, fallback: string) {
  if (error instanceof ApiException) return error.message;
  return (
    (error as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? fallback
  );
}


function AccountStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex h-11 w-full items-center justify-between rounded-md border border-border-primary bg-bg-input px-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Remove one MT5 account"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <Minus className="size-4" />
      </Button>
      <span className="min-w-28 text-center text-sm font-semibold tabular-nums">
        {value} MT5 {value === 1 ? "account" : "accounts"}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Add one MT5 account"
        disabled={value >= 10}
        onClick={() => onChange(Math.min(10, value + 1))}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}


export function SubscriptionPage() {
  const searchParams = useSearchParams();
  const subscriptionQuery = useSubscription();
  const checkout = useStartCheckout();
  const cancellation = useCancelSubscription();
  const subscription = subscriptionQuery.data;
  const [selectedCopyAccounts, setSelectedCopyAccounts] = useState<number | null>(null);
  const copyAccounts = selectedCopyAccounts ?? subscription?.copy_account_limit ?? 1;

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;
    let attempts = 0;
    const timer = window.setInterval(async () => {
      attempts += 1;
      const result = await subscriptionQuery.refetch();
      if (result.data?.has_journal_access || attempts >= 15) {
        window.clearInterval(timer);
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [searchParams, subscriptionQuery]);

  async function choosePlan(plan: BillingPlan) {
    try {
      const result = await checkout.mutateAsync(planRequest(plan, copyAccounts));
      if (result.checkout_url) {
        window.location.assign(result.checkout_url);
        return;
      }
      toast.success(
        result.action === "scheduled"
          ? "Plan change scheduled"
          : "Subscription updated",
      );
    } catch (error) {
      toast.error("Could not update subscription", {
        description: errorDetail(error, "Please try again."),
      });
    }
  }

  async function cancelPlan() {
    if (!window.confirm("Cancel your subscription at the end of this billing period?")) {
      return;
    }
    try {
      const result = await cancellation.mutateAsync();
      toast.success("Cancellation scheduled", { description: result.message });
    } catch (error) {
      toast.error("Could not cancel subscription", {
        description: errorDetail(error, "Please try again."),
      });
    }
  }

  if (subscriptionQuery.isLoading) {
    return <AppLoader label="Loading subscription" />;
  }

  const renewalDate = formatDate(subscription?.current_period_end ?? null);
  const pendingDate = formatDate(subscription?.pending_effective_at ?? null);
  const confirming =
    searchParams.get("checkout") === "success" && !subscription?.has_journal_access;

  return (
    <div className="p-4 pb-20 font-sans text-text-primary md:p-8 md:pb-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-xl font-bold">Subscription</h1>
          <p className="text-sm text-text-secondary">
            Choose the access and MT5 account capacity that fits your trading workflow.
          </p>
        </header>
      {(confirming || subscription?.status === "past_due") && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-md border p-4",
            confirming
              ? "border-border-secondary bg-bg-tertiary"
              : "border-warning/40 bg-warning-light",
          )}
          role="status"
        >
          {confirming ? (
            <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin" />
          ) : (
            <CreditCard className="mt-0.5 size-5 shrink-0 text-warning-text" />
          )}
          <div>
            <p className="text-sm font-semibold">
              {confirming ? "Confirming your payment" : "Payment needs to be updated"}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {confirming
                ? "Your access will activate as soon as the payment confirmation arrives."
                : `Access remains available until ${formatDate(subscription?.grace_ends_at ?? null)}.`}
            </p>
          </div>
        </div>
      )}

      {subscription?.has_journal_access && (
        <div className="flex flex-col justify-between gap-3 rounded-md border border-border-secondary bg-bg-secondary p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-strong" />
            <div>
              <p className="text-sm font-semibold">
                {subscription.plan === "copy" ? "Copy Trading" : "Journal"} is active
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {subscription.cancel_at_period_end
                  ? `Access ends ${renewalDate}.`
                  : `Renews ${renewalDate}.`}
                {pendingDate ? ` Your plan changes ${pendingDate}.` : ""}
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full bg-success-light px-3 py-1 text-xs font-semibold text-green-deep">
            Active
          </span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className={cn(
            "border-border-secondary bg-card-bg shadow-sm",
            subscription?.plan === "journal" && "ring-2 ring-accent",
          )}
        >
          <CardHeader>
            <CardTitle className="text-lg">Journal</CardTitle>
            <CardDescription>Trading records, analytics, reviews, and Partna AI.</CardDescription>
            <div className="pt-3">
              <span className="text-3xl font-bold tabular-nums">$17</span>
              <span className="text-sm text-text-secondary"> / month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {["MT5 journal syncing", "Performance analytics", "Trading reviews and notes"].map(
              (feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="size-4 text-green-strong" />
                  <span>{feature}</span>
                </div>
              ),
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={subscription?.plan === "journal" ? "outline" : "default"}
              disabled={
                checkout.isPending ||
                (subscription?.plan === "journal" && !subscription.pending_plan)
              }
              onClick={() => choosePlan("journal")}
            >
              {checkout.isPending && <Loader2 className="size-4 animate-spin" />}
              {subscription?.plan === "journal"
                ? "Current plan"
                : subscription?.plan === "copy"
                  ? "Switch at renewal"
                  : "Choose Journal"}
            </Button>
          </CardFooter>
        </Card>

        <Card
          className={cn(
            "border-border-secondary bg-card-bg shadow-sm",
            subscription?.plan === "copy" && "ring-2 ring-accent",
          )}
        >
          <CardHeader>
            <CardTitle className="text-lg">Copy Trading</CardTitle>
            <CardDescription>Journal access and unlimited Telegram signal channels.</CardDescription>
            <div className="pt-3">
              <span className="text-3xl font-bold tabular-nums">
                ${copyMonthlyPrice(copyAccounts)}
              </span>
              <span className="text-sm text-text-secondary"> / month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <AccountStepper value={copyAccounts} onChange={setSelectedCopyAccounts} />
            {["Everything in Journal", "Unlimited Telegram channels", "Automatic symbol matching"].map(
              (feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="size-4 text-green-strong" />
                  <span>{feature}</span>
                </div>
              ),
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={
                checkout.isPending ||
                (subscription?.plan === "copy" &&
                  subscription.copy_account_limit === copyAccounts &&
                  !subscription.pending_plan)
              }
              onClick={() => choosePlan("copy")}
            >
              {checkout.isPending && <Loader2 className="size-4 animate-spin" />}
              {subscription?.plan === "copy"
                ? subscription.copy_account_limit === copyAccounts
                  ? "Current plan"
                  : copyAccounts > subscription.copy_account_limit
                    ? "Add account capacity"
                    : "Reduce at renewal"
                : subscription?.plan === "journal"
                  ? "Upgrade to Copy Trading"
                  : "Choose Copy Trading"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <p className="text-center text-xs text-text-tertiary">
        Recurring card payments are charged in USD. Your card issuer may show the local currency equivalent.
      </p>

      {subscription?.has_journal_access && !subscription.cancel_at_period_end && (
        <div className="flex items-center justify-between gap-4 border-t border-border-primary pt-5">
          <div>
            <p className="text-sm font-semibold">Cancel subscription</p>
            <p className="text-xs text-text-secondary">Access continues through the paid period.</p>
          </div>
          <Button
            variant="outline"
            disabled={cancellation.isPending}
            onClick={cancelPlan}
          >
            {cancellation.isPending && <Loader2 className="size-4 animate-spin" />}
            Cancel
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
