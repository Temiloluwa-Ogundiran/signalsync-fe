"use client";

import { Check, ChevronDown, LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function SetupStep({
  number,
  title,
  description,
  state,
  summary,
  children,
}: {
  number: number;
  title: string;
  description: string;
  state: "complete" | "current" | "upcoming" | "blocked";
  summary?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(state === "current");
  const disabled = state === "upcoming" || state === "blocked";
  const expanded = state === "current" || (state === "complete" && open);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border bg-card-bg",
        state === "current"
          ? "border-border-secondary"
          : "border-border-primary",
      )}
    >
      <button
        type="button"
        aria-expanded={expanded}
        disabled={disabled}
        onClick={() => state === "complete" && setOpen((value) => !value)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left disabled:cursor-default"
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md border text-xs font-bold",
            state === "complete"
              ? "border-success/30 bg-success-light text-success"
              : state === "current"
                ? "border-border-secondary bg-bg-tertiary text-text-primary"
                : "border-border-primary bg-bg-tertiary text-text-tertiary",
          )}
        >
          {state === "complete" ? (
            <Check className="size-4" />
          ) : disabled ? (
            <LockKeyhole className="size-3.5" />
          ) : (
            number
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-text-primary">{title}</span>
          <span className="mt-0.5 block text-sm leading-5 text-text-secondary">
            {state === "complete" && summary ? summary : description}
          </span>
        </span>
        {state === "complete" ? (
          <ChevronDown
            className={cn(
              "mt-1 size-4 text-text-tertiary transition-transform",
              expanded && "rotate-180",
            )}
          />
        ) : null}
      </button>
      {expanded ? (
        <div className="border-t border-border-primary px-4 py-5 sm:px-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}
