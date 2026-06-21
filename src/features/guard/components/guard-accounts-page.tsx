"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useGuardAccounts,
  useGuardActions,
  useGuardConnectableAccounts,
} from "../hooks";
import { GuardRulesForm, type RulesFormResult } from "./guard-rules-form";
import type { GuardConnectableAccount } from "../types";

/**
 * /guard/accounts — manage which connected accounts are under Guard. Enabling
 * reuses an existing connected TradingAccount (no new credentials).
 */
export function GuardAccountsPage() {
  const { data: guardAccounts } = useGuardAccounts();
  const { data: connectable } = useGuardConnectableAccounts();
  const { enable, remove } = useGuardActions();

  const [picking, setPicking] = useState<GuardConnectableAccount | null>(null);
  const [size, setSize] = useState<string>("100000");

  const guardedIds = new Set(
    (guardAccounts ?? []).map((g) => g.trading_account_id),
  );
  const available = (connectable ?? []).filter((a) => !guardedIds.has(a.id));

  function handleEnable(result: RulesFormResult) {
    if (!picking) return;
    const sizeNum = Number(size);
    if (!Number.isFinite(sizeNum) || sizeNum <= 0) {
      toast.error("Enter a valid account size");
      return;
    }
    enable.mutate(
      {
        trading_account_id: picking.id,
        size: sizeNum,
        rule_spec: result.rule_spec,
        personal: result.personal,
      },
      {
        onSuccess: () => {
          toast.success("Guard enabled");
          setPicking(null);
        },
        onError: () => toast.error("Could not enable Guard"),
      },
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Guard Accounts</h1>
        <p className="text-sm text-text-secondary">
          Enable Partna Guard on a connected account. Guard is read-only — it
          watches and warns, it never closes your trades.
        </p>
      </div>

      {/* Active Guard accounts */}
      {guardAccounts && guardAccounts.length > 0 && (
        <Card>
          <CardContent className="divide-y divide-border-primary py-2">
            {guardAccounts.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={
                      g.connection_health === "offline"
                        ? "inline-block h-2 w-2 rounded-full bg-danger"
                        : "inline-block h-2 w-2 rounded-full bg-success"
                    }
                  />
                  <span className="text-sm font-medium text-text-primary">
                    {g.display_name ?? g.broker_name ?? "Account"}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    ${g.size.toLocaleString("en-US")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    remove.mutate(g.id, {
                      onSuccess: () => toast.success("Guard disabled"),
                    })
                  }
                  disabled={remove.isPending}
                >
                  Disable
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Enable on a connected account */}
      {picking ? (
        <Card>
          <CardContent className="space-y-5 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">
                Enable Guard ·{" "}
                {picking.display_name ?? picking.broker_name}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setPicking(null)}>
                Cancel
              </Button>
            </div>

            <div className="max-w-xs space-y-1">
              <label className="text-sm text-text-secondary">
                Challenge starting balance
              </label>
              <Input
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </div>

            <GuardRulesForm
              submitting={enable.isPending}
              onSubmit={handleEnable}
              submitLabel="Enable Guard"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-4">
            <h2 className="mb-3 text-sm font-semibold text-text-primary">
              Connected accounts
            </h2>
            {available.length === 0 ? (
              <p className="text-sm text-text-tertiary">
                No eligible connected accounts. Connect one under Settings →
                Accounts first.
              </p>
            ) : (
              <div className="divide-y divide-border-primary">
                {available.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {a.display_name ?? a.broker_name}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {a.broker_name} · {a.broker_login}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => setPicking(a)}>
                      Enable Guard
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
