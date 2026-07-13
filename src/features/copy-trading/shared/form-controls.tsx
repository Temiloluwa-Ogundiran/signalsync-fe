"use client";

import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { FieldHelp } from "./field-help";

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-border-primary pt-5 first:border-0 first:pt-0">
      <div>
        <h3 className="font-semibold text-text-primary">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="flex items-center gap-1.5 font-medium text-text-primary">
        {label}
        {help ? <FieldHelp>{help}</FieldHelp> : null}
      </span>
      {children}
    </label>
  );
}

export function Select({
  value,
  onChange,
  children,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-md border border-border-primary bg-bg-input px-3 text-sm text-text-primary outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
    >
      {children}
    </select>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
  compact = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  compact?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4",
        !compact && "rounded-md border border-border-primary px-3 py-3",
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs leading-5 text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
