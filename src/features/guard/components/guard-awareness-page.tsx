"use client";

import { useState } from "react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useGuardAccounts, useGuardMonitor } from "../hooks";
import { AwarenessDashboard } from "./awareness-dashboard";
import { GuardPlanPanel } from "./guard-plan-panel";
import { GuardAccountSwitcher } from "./guard-account-switcher";

type GuardTab = "monitor" | "plan";

/**
 * The /guard awareness surface: pick a Guard-enabled account and render its live
 * monitor. Empty state funnels the user to /guard/accounts to enable Guard.
 */
export function GuardAwarenessPage() {
  const { data: accounts, isLoading: loadingAccounts } = useGuardAccounts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<GuardTab>("monitor");

  const activeId = selectedId ?? accounts?.[0]?.id ?? undefined;
  const { data: monitor, isLoading: loadingMonitor } = useGuardMonitor(activeId);

  if (loadingAccounts) {
    return <p className="p-6 text-sm text-text-tertiary">Loading Guard…</p>;
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Card className="mx-auto mt-10 max-w-md">
        <CardContent className="space-y-3 py-8 text-center">
          <h2 className="text-lg font-semibold text-text-primary">
            No accounts under Guard yet
          </h2>
          <p className="text-sm text-text-secondary">
            Enable Partna Guard on a connected account to start watching your
            distance to every firm line in real time.
          </p>
          <Button asChild>
            <Link href="/guard/accounts">Enable Guard on an account</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Partna Guard</h1>
          <p className="text-sm text-text-secondary">
            Get funded, stay funded — your live distance to every line.
          </p>
        </div>
        <GuardAccountSwitcher
          accounts={accounts}
          activeId={activeId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Monitor / Plan tabs */}
      <div className="flex gap-1 border-b border-border-primary">
        <TabButton active={tab === "monitor"} onClick={() => setTab("monitor")}>
          Monitor
        </TabButton>
        <TabButton active={tab === "plan"} onClick={() => setTab("plan")}>
          Plan
        </TabButton>
      </div>

      {loadingMonitor || !monitor ? (
        <p className="p-6 text-sm text-text-tertiary">Loading live monitor…</p>
      ) : tab === "monitor" ? (
        <AwarenessDashboard monitor={monitor} />
      ) : (
        <GuardPlanPanel monitor={monitor} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand text-text-primary"
          : "border-transparent text-text-secondary hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}
