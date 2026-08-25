"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CopyRouteInput } from "../types";
import { Field, FormSection, Select, Toggle } from "../shared/form-controls";

export const defaultCopyPreferences: CopyRouteInput = {
  source_id: "",
  target_connection_id: "",
  fixed_lot: "0.10",
  take_profit_mode: "all",
  lot_distribution: "split_total",
  pending_orders_enabled: true,
  minimum_fields: "direction_symbol_sl_tp",
  assembly_window_seconds: 90,
  process_all_group_authors: false,
  notify_success: true,
  notify_failure: true,
  semantic_duplicate_window_seconds: 30,
  allow_sl_tp_updates: true,
  allow_break_even: true,
  allow_additional_tp: true,
  allow_partial_close: true,
  allow_full_close: true,
  allow_pending_cancel: true,
  unsafe_minimum_confirmed: false,
};

export function PreferencesStep({
  value,
  onChange,
  onContinue,
  busy,
  submitLabel = "Review copy rule",
}: {
  value: CopyRouteInput;
  onChange: (value: CopyRouteInput) => void;
  onContinue: () => void;
  busy: boolean;
  submitLabel?: string;
}) {
  const [advanced, setAdvanced] = useState(false);
  const usesUnsafeMinimum =
    value.minimum_fields !== "direction_symbol_sl_tp";
  const update = <K extends keyof CopyRouteInput>(
    key: K,
    next: CopyRouteInput[K],
  ) => onChange({ ...value, [key]: next });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Trade size"
          help="The lot size used when a copied trade is placed."
        >
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={value.fixed_lot}
            onChange={(event) => update("fixed_lot", event.target.value)}
          />
        </Field>
        <Field
          label="Take-profit handling"
          help="Choose whether SignalSync places one or several positions when a signal has multiple targets."
        >
          <Select
            value={value.take_profit_mode}
            onChange={(next) =>
              update(
                "take_profit_mode",
                next as CopyRouteInput["take_profit_mode"],
              )
            }
          >
            <option value="all">Place a trade for every take profit</option>
            <option value="lowest">Use the nearest take profit</option>
            <option value="highest">Use the furthest take profit</option>
          </Select>
        </Field>
      </div>

      {value.take_profit_mode === "all" ? (
        <Field
          label="Multiple take-profit sizing"
          help="Split one total trade size across positions, or use the full size for every position."
        >
          <Select
            value={value.lot_distribution}
            onChange={(next) =>
              update(
                "lot_distribution",
                next as CopyRouteInput["lot_distribution"],
              )
            }
          >
            <option value="split_total">Split the total trade size</option>
            <option value="fixed_each">
              Use the trade size for every position
            </option>
          </Select>
        </Field>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="When to enter"
          help="Choose which signal details must arrive before SignalSync places the trade."
        >
          <Select
            value={value.minimum_fields}
            onChange={(next) =>
              update(
                "minimum_fields",
                next as CopyRouteInput["minimum_fields"],
              )
            }
          >
            <option value="direction_symbol_sl_tp">
              Wait for stop loss and take profit (recommended)
            </option>
            <option value="direction_symbol_sl">Wait for stop loss</option>
            <option value="direction_symbol_tp">Wait for take profit</option>
            <option value="direction_symbol_entry">Wait for entry price</option>
            <option value="direction_symbol">
              Enter immediately without SL or TP
            </option>
          </Select>
        </Field>
        {value.minimum_fields !== "direction_symbol" ? (
          <Field
            label="Waiting time"
            help="If the required details do not arrive before this time ends, the signal is marked as missed."
          >
            <Input
              type="number"
              min="1"
              max="600"
              value={value.assembly_window_seconds ?? 90}
              onChange={(event) =>
                update(
                  "assembly_window_seconds",
                  Number(event.target.value),
                )
              }
            />
          </Field>
        ) : (
          <div className="rounded-md border border-border-primary bg-bg-tertiary px-3 py-3 text-sm leading-6 text-text-secondary">
            The trade is placed as soon as direction and symbol arrive. Later
            stop-loss and take-profit messages can update it automatically.
          </div>
        )}
      </div>

      {usesUnsafeMinimum ? (
        <Toggle
          label="Allow entry before every protection detail arrives"
          description="The trade may be placed without stop loss, take profit, or entry details selected above. Later channel updates can still modify it."
          checked={value.unsafe_minimum_confirmed}
          onChange={(next) => update("unsafe_minimum_confirmed", next)}
        />
      ) : null}

      <Toggle
        label="Pending orders"
        description="Send limit and stop orders to the broker as soon as the channel posts them."
        checked={value.pending_orders_enabled}
        onChange={(next) => update("pending_orders_enabled", next)}
      />

      <button
        type="button"
        onClick={() => setAdvanced((current) => !current)}
        className="flex w-full items-center justify-between border-t border-border-primary pt-4 text-left text-sm font-semibold text-text-primary"
      >
        Advanced settings
        <ChevronDown
          className={`size-4 transition-transform ${advanced ? "rotate-180" : ""}`}
        />
      </button>

      {advanced ? (
        <div className="space-y-5">
          <FormSection
            title="Message authors"
            description="Choose whose messages can control trades in Telegram groups."
          >
            <Toggle
              label="Accept messages from all group members"
              description="Off by default. Channel posts and group administrator messages are always accepted."
              checked={value.process_all_group_authors}
              onChange={(next) => update("process_all_group_authors", next)}
            />
          </FormSection>

          <FormSection
            title="Duplicate protection"
            description="Ignore an identical instruction from this route for a short period."
          >
            <Field
              label="Duplicate window"
              help="Use 0 only when the channel intentionally repeats identical instructions."
            >
              <Input
                type="number"
                min="0"
                max="3600"
                value={value.semantic_duplicate_window_seconds}
                onChange={(event) => update("semantic_duplicate_window_seconds", Number(event.target.value))}
              />
            </Field>
          </FormSection>

          <FormSection title="Trade changes">
            {[
              ["allow_sl_tp_updates", "Stop-loss and take-profit changes"],
              ["allow_break_even", "Break-even updates"],
              ["allow_additional_tp", "Additional take profits"],
              ["allow_partial_close", "Partial closes"],
              ["allow_full_close", "Full closes"],
              ["allow_pending_cancel", "Pending-order cancellation"],
            ].map(([key, label]) => (
              <Toggle
                key={key}
                compact
                label={label}
                checked={Boolean(value[key as keyof CopyRouteInput])}
                onChange={(next) =>
                  update(key as keyof CopyRouteInput, next as never)
                }
              />
            ))}
          </FormSection>

          <FormSection title="Notifications">
            <Toggle
              compact
              label="Successful trade alerts"
              checked={value.notify_success}
              onChange={(next) => update("notify_success", next)}
            />
            <Toggle
              compact
              label="Failure alerts"
              checked={value.notify_failure}
              onChange={(next) => update("notify_failure", next)}
            />
          </FormSection>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={
            busy ||
            Number(value.fixed_lot) <= 0 ||
            (usesUnsafeMinimum && !value.unsafe_minimum_confirmed)
          }
        >
          {busy ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
