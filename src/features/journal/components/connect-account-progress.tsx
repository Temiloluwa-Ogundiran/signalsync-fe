"use client";

import { Circle, Loader2, ShieldCheck, Terminal } from "lucide-react";

interface Phase {
  id: "verifying" | "saving" | "queueing";
  label: string;
  detail: string;
  state: "active" | "pending";
}

const PHASES: Phase[] = [
  {
    id: "verifying",
    label: "Verifying MT5 credentials",
    detail: "Checking the account number, server, and investor password with MT5.",
    state: "active",
  },
  {
    id: "saving",
    label: "Saving the account",
    detail: "Starts only after MT5 accepts the credentials.",
    state: "pending",
  },
  {
    id: "queueing",
    label: "Starting history import",
    detail: "Runs in the background after this modal closes.",
    state: "pending",
  },
];

export function ConnectAccountProgress() {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center">
      <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 animate-pulse">
        <Terminal className="w-8 h-8 text-accent animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-accent/5 filter blur-md animate-ping" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight text-text-primary">
          Verifying Your MT5 Account
        </h3>
        <p className="text-sm text-text-secondary max-w-xs mx-auto">
          Keep this modal open while MT5 checks the credentials. History import starts in the background after verification succeeds.
        </p>
      </div>

      <div className="w-full max-w-sm h-1.5 bg-bg-tertiary rounded-full overflow-hidden relative border border-border-primary/50">
        <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full animate-[shimmer_1.5s_infinite]" 
             style={{
               animation: 'shimmer 1.5s infinite linear'
             }}
        />
      </div>

      <div className="w-full max-w-sm p-4 rounded-xl border border-border-primary bg-bg-tertiary/40 backdrop-blur-md space-y-3.5 text-left">
        {PHASES.map((phase) => {
          const isActive = phase.state === "active";

          return (
            <div
              key={phase.id}
              className={`flex items-start gap-3 text-xs transition-all duration-300 ${
                isActive
                  ? "text-accent font-medium"
                  : "text-text-secondary/60"
              }`}
            >
              {isActive ? (
                <Loader2 className="mt-0.5 w-4 h-4 text-accent animate-spin shrink-0" />
              ) : (
                <Circle className="mt-0.5 w-4 h-4 text-text-secondary/30 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-wide">{phase.label}</span>
                  {isActive ? (
                    <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent animate-pulse">
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 leading-snug text-text-tertiary">
                  {phase.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex max-w-sm items-start gap-2 rounded-lg border border-border-primary bg-bg-secondary/60 px-3 py-2 text-left text-xs text-text-secondary">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <span>
          If this succeeds, your account will appear as connected while the first trade-history sync continues separately.
        </span>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}
