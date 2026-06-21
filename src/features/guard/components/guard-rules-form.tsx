"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import type {
  GuardRuleSpecInput,
  GuardPersonalInput,
  DailyType,
  DrawdownType,
} from "../types";

/**
 * Firm-rules form. The product is an alarm — so by default we ask for only the
 * TWO numbers that define the lines: daily loss % and max drawdown %. Everything
 * else (basis, anchor, trailing, reset time, soft-breach, consistency, min-days,
 * personal limits) has a sensible default and lives under "Advanced settings".
 *
 * Percentages are entered as WHOLE NUMBERS (5 = 5%) and converted to fractions
 * (0.05) on submit — the BE engine works in fractions. The FE never computes any
 * buffer; this only captures the firm's published rules.
 */
const schema = z.object({
  firm: z.string().max(80).optional(),
  // Visible by default.
  daily_loss_pct: z.coerce.number().gt(0).lt(100),
  max_dd_pct: z.coerce.number().gt(0).lt(100),
  // Advanced.
  daily_basis: z.enum(["EQUITY", "BALANCE"]),
  daily_type: z.enum(["STATIC", "TRAILING"]),
  daily_anchor: z.enum(["DAY_START_BALANCE", "HIGHER_OF_BALANCE_EQUITY"]),
  reset_hour: z.coerce.number().int().min(0).max(23),
  reset_minute: z.coerce.number().int().min(0).max(59),
  reset_tz: z.string().min(1),
  soft_pct: z.coerce.number().min(0).max(99),
  max_dd_type: z.enum(["STATIC", "TRAILING"]),
  locks_at_initial: z.boolean(),
  profit_target_pct: z.coerce.number().gt(0).lt(100),
  min_days: z.coerce.number().int().min(0).max(60),
  consistency_cap_pct: z.coerce.number().min(0).max(100),
  personal_daily_pct: z.coerce.number().min(10).max(100),
  personal_dd_pct: z.coerce.number().min(10).max(100),
});

/** Output (post-coercion) shape — what handleSubmit receives. */
type FormValues = z.output<typeof schema>;
/** Input shape — what the fields hold before coercion (numbers may be strings). */
type FormInput = z.input<typeof schema>;

export interface RulesFormResult {
  rule_spec: GuardRuleSpecInput;
  personal: GuardPersonalInput;
}

const DEFAULTS: FormInput = {
  firm: "",
  daily_loss_pct: 5,
  max_dd_pct: 10,
  daily_basis: "EQUITY",
  daily_type: "STATIC",
  daily_anchor: "DAY_START_BALANCE",
  reset_hour: 0,
  reset_minute: 0,
  reset_tz: "UTC",
  soft_pct: 0,
  max_dd_type: "TRAILING",
  locks_at_initial: true,
  profit_target_pct: 8,
  min_days: 0,
  consistency_cap_pct: 0,
  personal_daily_pct: 100,
  personal_dd_pct: 100,
};

export function GuardRulesForm({
  initial,
  submitting,
  onSubmit,
  submitLabel = "Save rules",
}: {
  initial?: Partial<FormInput>;
  submitting?: boolean;
  onSubmit: (result: RulesFormResult) => void;
  submitLabel?: string;
}) {
  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...DEFAULTS, ...initial },
  });
  const [advanced, setAdvanced] = useState(false);

  function handle(values: FormValues) {
    const rule_spec: GuardRuleSpecInput = {
      firm: values.firm || undefined,
      daily_loss: {
        pct: values.daily_loss_pct / 100,
        basis: values.daily_basis,
        type: values.daily_type as DailyType,
        anchor: values.daily_anchor,
        reset_hour: values.reset_hour,
        reset_minute: values.reset_minute,
        reset_tz: values.reset_tz,
        soft_pct: values.soft_pct / 100,
      },
      max_drawdown: {
        pct: values.max_dd_pct / 100,
        type: values.max_dd_type as DrawdownType,
        anchor_ref:
          values.max_dd_type === "TRAILING" ? "PEAK_EQUITY" : "INITIAL_BALANCE",
        locks_at_initial:
          values.max_dd_type === "TRAILING" && values.locks_at_initial,
      },
      profit_target: { pct: values.profit_target_pct / 100 },
      min_days:
        values.min_days > 0
          ? { count: values.min_days, day_counts_if: "ANY_TRADE" }
          : null,
      consistency:
        values.consistency_cap_pct > 0
          ? { cap: values.consistency_cap_pct / 100, basis: "TOTAL_PROFIT" }
          : null,
    };
    const personal: GuardPersonalInput = {
      daily_frac: values.personal_daily_pct / 100,
      dd_frac: values.personal_dd_pct / 100,
    };
    onSubmit({ rule_spec, personal });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handle)} className="space-y-6">
        <Section
          title="The two lines"
          subtitle="Copy these straight from your firm's dashboard. That's all Guard needs to start watching."
        >
          <NumberField form={form} name="daily_loss_pct" label="Daily loss limit %" />
          <NumberField form={form} name="max_dd_pct" label="Max drawdown %" />
        </Section>

        {/* Advanced settings — collapsed by default */}
        <div className="rounded-lg border border-border-primary">
          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-text-primary"
            aria-expanded={advanced}
          >
            <span>
              Advanced settings
              <span className="ml-2 text-xs font-normal text-text-tertiary">
                basis, reset time, trailing, consistency, min-days, your limits
              </span>
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              className={cn(
                "shrink-0 text-text-tertiary transition-transform",
                advanced && "rotate-180",
              )}
            />
          </button>

          {advanced && (
            <div className="space-y-6 border-t border-border-primary px-4 py-5">
              <Section title="Daily loss details">
                <SelectField
                  form={form}
                  name="daily_basis"
                  label="Daily basis"
                  options={[
                    ["EQUITY", "Equity (counts floating P&L)"],
                    ["BALANCE", "Balance (closed only)"],
                  ]}
                />
                <SelectField
                  form={form}
                  name="daily_type"
                  label="Daily type"
                  options={[
                    ["STATIC", "Static (fixed for the day)"],
                    ["TRAILING", "Trailing (follows the day's peak)"],
                  ]}
                />
                <SelectField
                  form={form}
                  name="daily_anchor"
                  label="Daily anchor (static only)"
                  options={[
                    ["DAY_START_BALANCE", "Day-start balance"],
                    ["HIGHER_OF_BALANCE_EQUITY", "Higher of balance/equity"],
                  ]}
                />
                <NumberField form={form} name="reset_hour" label="Daily reset hour (0–23)" />
                <NumberField form={form} name="reset_minute" label="Daily reset minute (0–59)" />
                <TextField form={form} name="reset_tz" label="Reset timezone (e.g. Europe/Prague)" />
                <NumberField
                  form={form}
                  name="soft_pct"
                  label="Soft-breach % of daily allowance (0 = none)"
                />
              </Section>

              <Section title="Max drawdown details">
                <SelectField
                  form={form}
                  name="max_dd_type"
                  label="Drawdown type"
                  options={[
                    ["STATIC", "Static (from initial balance)"],
                    ["TRAILING", "Trailing (follows peak)"],
                  ]}
                />
                <SwitchField
                  form={form}
                  name="locks_at_initial"
                  label="Trailing locks at initial balance once +max DD%"
                />
              </Section>

              <Section title="Pass conditions">
                <NumberField form={form} name="profit_target_pct" label="Profit target %" />
                <NumberField form={form} name="min_days" label="Min trading days (0 = none)" />
                <NumberField
                  form={form}
                  name="consistency_cap_pct"
                  label="Consistency cap % (0 = none)"
                />
              </Section>

              <Section
                title="Your stricter limits (amber line)"
                subtitle="As a % of the firm allowance. 100% = sit exactly on the firm line; lower = trip earlier. Never looser than the firm."
              >
                <NumberField
                  form={form}
                  name="personal_daily_pct"
                  label="Personal daily limit (% of firm, 10–100)"
                />
                <NumberField
                  form={form}
                  name="personal_dd_pct"
                  label="Personal drawdown limit (% of firm, 10–100)"
                />
              </Section>
            </div>
          )}
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="text-xs text-text-tertiary">{subtitle}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function NumberField({ form, name, label }: { form: any; name: keyof FormValues; label: string }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type="number" step="any" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TextField({ form, name, label }: { form: any; name: keyof FormValues; label: string }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type="text" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SelectField({
  form,
  name,
  label,
  options,
}: {
  form: any;
  name: keyof FormValues;
  label: string;
  options: [string, string][];
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <select
              {...field}
              className="h-10 w-full rounded-lg border border-border-primary bg-bg-input px-3 text-sm text-text-primary"
            >
              {options.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SwitchField({ form, name, label }: { form: any; name: keyof FormValues; label: string }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between gap-3 sm:col-span-2">
          <FormLabel className="font-normal">{label}</FormLabel>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormDescription className="sr-only">{label}</FormDescription>
        </FormItem>
      )}
    />
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
