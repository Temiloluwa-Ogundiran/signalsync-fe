"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { CopyAccountPolicy } from "../types";
import { useUpdateCopyAccountPolicy } from "../hooks";
import { apiError } from "../utils";

function symbolList(value: string) {
  return [
    ...new Set(
      value
        .split(/[\s,]+/)
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean),
    ),
  ];
}

export function AccountSafetyForm({
  connectionId,
  policy,
}: {
  connectionId: string;
  policy: CopyAccountPolicy;
}) {
  const updatePolicy = useUpdateCopyAccountPolicy();
  const [enabled, setEnabled] = useState(!policy.is_paused);
  const [perTrade, setPerTrade] = useState(policy.max_lot_per_trade);
  const [totalLots, setTotalLots] = useState(policy.max_lot);
  const [positions, setPositions] = useState(String(policy.max_open_positions));
  const [dailyLoss, setDailyLoss] = useState(policy.daily_loss_limit ?? "");
  const [drawdown, setDrawdown] = useState(policy.max_drawdown_percent ?? "");
  const [signalAge, setSignalAge] = useState(
    String(policy.market_signal_max_age_seconds),
  );
  const [allowed, setAllowed] = useState(policy.allowed_symbols.join(", "));
  const [blocked, setBlocked] = useState(policy.blocked_symbols.join(", "));
  const invalid =
    Number(perTrade) <= 0 ||
    Number(totalLots) < Number(perTrade) ||
    Number(positions) < 1 ||
    Number(signalAge) < 1 ||
    Number(signalAge) > 3600 ||
    (dailyLoss !== "" && Number(dailyLoss) <= 0) ||
    (drawdown !== "" && (Number(drawdown) <= 0 || Number(drawdown) > 100));

  const save = async () => {
    try {
      await updatePolicy.mutateAsync({
        connectionId,
        payload: {
          is_paused: !enabled,
          max_lot_per_trade: perTrade,
          max_lot: totalLots,
          max_open_positions: Number(positions),
          daily_loss_limit: dailyLoss || null,
          max_drawdown_percent: drawdown || null,
          market_signal_max_age_seconds: Number(signalAge),
          allowed_symbols: symbolList(allowed),
          blocked_symbols: symbolList(blocked),
        },
      });
      toast.success("Account safety settings saved");
    } catch (error) {
      toast.error("Safety settings could not be saved", {
        description: apiError(error),
      });
    }
  };

  return (
    <fieldset className="mt-4 border-t border-border-primary pt-4">
      <legend className="flex items-center gap-2 pr-3 text-sm font-semibold text-text-primary">
        <ShieldCheck aria-hidden="true" className="size-4 text-success" />
        Account Safety
      </legend>
      <p className="mt-1 max-w-2xl text-xs leading-5 text-text-secondary">
        New trades are checked against these limits before they reach the
        broker. Close and protection updates remain available when a limit is
        reached.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SafetyNumber
          id={`${connectionId}-per-trade`}
          label="Maximum Size for 1 Trade"
          help="The largest copied order this account can receive."
          value={perTrade}
          onChange={setPerTrade}
          min="0.01"
          step="0.01"
        />
        <SafetyNumber
          id={`${connectionId}-total-lots`}
          label="Maximum Total Copied Lots"
          help="All open and pending copied trades combined."
          value={totalLots}
          onChange={setTotalLots}
          min="0.01"
          step="0.01"
        />
        <SafetyNumber
          id={`${connectionId}-positions`}
          label="Maximum Open Positions"
          help="Stops new entries when this many copied trades are active."
          value={positions}
          onChange={setPositions}
          min="1"
          step="1"
        />
        <SafetyNumber
          id={`${connectionId}-signal-age`}
          label="Newest Signal Age"
          help="Market entries older than this many seconds are ignored."
          value={signalAge}
          onChange={setSignalAge}
          min="1"
          max="3600"
          step="1"
          suffix="seconds"
        />
        <SafetyNumber
          id={`${connectionId}-daily-loss`}
          label="Stop After Today's Loss"
          help="Amount in the account currency. Leave blank to disable."
          value={dailyLoss}
          onChange={setDailyLoss}
          min="0.01"
          step="0.01"
          optional
        />
        <SafetyNumber
          id={`${connectionId}-drawdown`}
          label="Maximum Equity Drawdown"
          help="Percentage from the highest observed account equity."
          value={drawdown}
          onChange={setDrawdown}
          min="0.01"
          max="100"
          step="0.01"
          suffix="%"
          optional
        />
        <SafetyText
          id={`${connectionId}-allowed`}
          label="Only Copy These Symbols"
          help="Example: EURUSD, XAUUSD"
          value={allowed}
          onChange={setAllowed}
          placeholder="All symbols"
        />
        <SafetyText
          id={`${connectionId}-blocked`}
          label="Never Copy These Symbols"
          help="Broker suffixes are matched automatically."
          value={blocked}
          onChange={setBlocked}
          placeholder="No blocked symbols"
        />
      </div>
      <div className="mt-5 flex flex-col gap-3 border-t border-border-primary pt-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          <span>
            <span className="block text-sm font-medium text-text-primary">
              Allow New Copied Trades
            </span>
            <span className="block text-xs text-text-secondary">
              {enabled
                ? "New signals can place trades."
                : "New entries are paused for this account."}
            </span>
          </span>
        </label>
        <Button
          onClick={save}
          disabled={invalid || updatePolicy.isPending}
          aria-live="polite"
        >
          {updatePolicy.isPending ? "Saving..." : "Save Safety Settings"}
        </Button>
      </div>
      {invalid ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          Check the limits. Total copied lots must be at least the size of one
          trade.
        </p>
      ) : null}
    </fieldset>
  );
}

function SafetyNumber({
  id,
  label,
  help,
  value,
  onChange,
  suffix,
  optional,
  ...input
}: {
  id: string;
  label: string;
  help: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  optional?: boolean;
  min?: string;
  max?: string;
  step?: string;
}) {
  const helpId = `${id}-help`;
  return (
    <label htmlFor={id} className="grid min-w-0 gap-1.5 text-sm">
      <span className="font-medium text-text-primary">
        {label}
        {optional ? (
          <span className="font-normal text-text-tertiary"> (Optional)</span>
        ) : null}
      </span>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          aria-describedby={helpId}
          onChange={(event) => onChange(event.target.value)}
          className={suffix ? "pr-16" : undefined}
          {...input}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-text-tertiary">
            {suffix}
          </span>
        ) : null}
      </div>
      <span id={helpId} className="text-xs leading-5 text-text-secondary">
        {help}
      </span>
    </label>
  );
}

function SafetyText({
  id,
  label,
  help,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  help: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const helpId = `${id}-help`;
  return (
    <label htmlFor={id} className="grid min-w-0 gap-1.5 text-sm">
      <span className="font-medium text-text-primary">
        {label}{" "}
        <span className="font-normal text-text-tertiary">(Optional)</span>
      </span>
      <Input
        id={id}
        name={id}
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        aria-describedby={helpId}
        onChange={(event) => onChange(event.target.value)}
      />
      <span id={helpId} className="text-xs leading-5 text-text-secondary">
        {help}
      </span>
    </label>
  );
}
