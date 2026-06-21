"use client";

import { useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { SecurityCheckIcon } from "@hugeicons/core-free-icons";

import { Card, CardContent } from "@/components/ui/card";

import { useGuardAccounts, useGuardActions, useGuardRules } from "../hooks";
import { GuardAccountSwitcher } from "./guard-account-switcher";
import { GuardRulesForm, type RulesFormResult } from "./guard-rules-form";
import type { GuardAccount } from "../types";

/**
 * /guard/rules — edit a Guard-enabled account's firm rules + personal clamp, and
 * pin the plain-English contract the BE generates from them.
 */
export function GuardRulesPage() {
  const { data: accounts, isLoading } = useGuardAccounts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = selectedId ?? accounts?.[0]?.id ?? undefined;
  const account = accounts?.find((a) => a.id === activeId);

  const { data: rulesView } = useGuardRules(activeId);
  const { update } = useGuardActions();

  if (isLoading) {
    return <p className="p-6 text-sm text-text-tertiary">Loading…</p>;
  }

  if (!accounts || accounts.length === 0) {
    return (
      <p className="p-6 text-sm text-text-secondary">
        Enable Guard on an account first to configure its rules.
      </p>
    );
  }

  function handleSubmit(result: RulesFormResult) {
    if (!activeId) return;
    update.mutate(
      { id: activeId, payload: result },
      {
        onSuccess: () => toast.success("Guard rules updated"),
        onError: () => toast.error("Could not save rules"),
      },
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            Rules &amp; Contract
          </h1>
          <p className="text-sm text-text-secondary">
            The lines Guard watches, and exactly what it will do.
          </p>
        </div>
        <GuardAccountSwitcher
          accounts={accounts}
          activeId={activeId}
          onSelect={setSelectedId}
        />
      </div>

      {rulesView && (
        <Card>
          <CardContent className="flex items-start gap-3 py-4">
            <HugeiconsIcon
              icon={SecurityCheckIcon}
              size={18}
              className="mt-0.5 shrink-0 text-brand"
            />
            <p className="text-sm leading-relaxed text-text-secondary">
              {rulesView.contract}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-6">
          {account && (
            <GuardRulesForm
              key={account.id}
              initial={toFormInitial(account)}
              submitting={update.isPending}
              onSubmit={handleSubmit}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Map a stored GuardAccount back to whole-number form values. */
function toFormInitial(a: GuardAccount) {
  const r = a.rule_spec;
  return {
    firm: r.firm ?? "",
    daily_loss_pct: r.daily_loss.pct * 100,
    daily_basis: r.daily_loss.basis,
    daily_anchor: r.daily_loss.anchor,
    reset_hour: r.daily_loss.reset_hour,
    reset_tz: r.daily_loss.reset_tz,
    max_dd_pct: r.max_drawdown.pct * 100,
    max_dd_type: r.max_drawdown.type,
    locks_at_initial: r.max_drawdown.locks_at_initial,
    profit_target_pct: r.profit_target.pct * 100,
    min_days: r.min_days?.count ?? 0,
    consistency_cap_pct: r.consistency ? r.consistency.cap * 100 : 0,
    personal_daily_pct: (a.personal?.daily_frac ?? 1) * 100,
    personal_dd_pct: (a.personal?.dd_frac ?? 1) * 100,
  };
}
