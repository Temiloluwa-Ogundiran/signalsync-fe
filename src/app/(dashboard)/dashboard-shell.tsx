"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout";
import { AppNav } from "@/components/layout/app-nav";
import { useNavUiStore } from "@/components/layout/nav-ui-store";
import { ConnectAccountModal } from "@/features/journal/components/connect-account-modal";
import { AiDockProvider } from "@/features/ai/components/ai-dock-provider";
import { DemoDataBanner } from "@/features/journal/components/demo-data-banner";
import { useOnMountSync } from "@/features/journal/hooks/use-on-mount-sync";
import { AppLoader } from "@/components/app-loader";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/features/billing/hooks";
import { resolveSubscriptionGate } from "@/features/billing/subscription-gate";
import { useSession } from "next-auth/react";


function EntitledDashboardEffects({ enabled }: { enabled: boolean }) {
  useOnMountSync({ enabled });
  return null;
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const mobileNavOpen = useNavUiStore((s) => s.mobileNavOpen);
  const { status: sessionStatus } = useSession();
  const subscription = useSubscription();
  const isSubscriptionPage = pathname.startsWith("/settings/subscription");
  const gate = resolveSubscriptionGate({
    pathname,
    sessionStatus,
    queryPending: subscription.isPending,
    queryError: subscription.isError,
    subscription: subscription.data,
  });

  useEffect(() => {
    if (gate === "redirect") {
      router.replace("/settings/subscription");
    }
  }, [gate, router]);

  if (gate === "loading" || gate === "redirect") {
    return <AppLoader fullScreen />;
  }

  if (gate === "error" && !isSubscriptionPage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-primary p-6 text-center">
        <p className="text-sm font-semibold text-text-primary">Subscription status is unavailable</p>
        <Button variant="outline" onClick={() => subscription.refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  return (
    <AiDockProvider>
      {subscription.data?.has_journal_access && (
        <EntitledDashboardEffects
          enabled={pathname !== "/dashboard" && pathname !== "/journal"}
        />
      )}
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[9999] -translate-y-20 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      {/* Column layout: a full-width header on top (logo + global actions), then
          a row of nav + content below. The header owns the logo so its size is
          independent of the nav column width. */}
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-bg-primary">
        <Suspense
          fallback={
            <div
              className="relative z-header flex h-header shrink-0 items-center bg-chrome-bar-bg px-chrome"
              aria-hidden
            />
          }
        >
          <Header />
        </Suspense>

        <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
          {/* Two-tier icon rail + contextual sidebar (registry-driven). */}
          <AppNav />

          <main
            id="main-content"
            tabIndex={-1}
            className={cn(
              "scrollbar-thin min-w-0 flex-1 overflow-x-hidden bg-bg-canvas",
              mobileNavOpen ? "overflow-y-hidden" : "overflow-y-auto",
            )}
          >
            <DemoDataBanner />
            {subscription.data?.plan && !subscription.data.has_journal_access && (
              <div className="flex flex-col justify-between gap-3 border-b border-warning/30 bg-warning-light px-4 py-3 text-sm sm:flex-row sm:items-center sm:px-6">
                <span className="font-medium text-warning-text">
                  Your subscription is inactive. Your records are available in read-only mode.
                </span>
                <Button asChild size="sm" variant="outline">
                  <Link href="/settings/subscription">Renew subscription</Link>
                </Button>
              </div>
            )}
            {children}
          </main>
        </div>

        {subscription.data?.has_journal_access && <ConnectAccountModal />}
      </div>
    </AiDockProvider>
  );
}
