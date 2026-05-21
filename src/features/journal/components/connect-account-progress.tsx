"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, Terminal } from "lucide-react";

interface Phase {
  id: "verifying" | "syncing" | "finalizing";
  label: string;
  duration: number; // approximate duration in ms to simulate
}

const PHASES: Phase[] = [
  { id: "verifying", label: "Verifying credentials", duration: 3000 },
  { id: "syncing", label: "Syncing account history", duration: 5000 },
  { id: "finalizing", label: "Finalizing your journal", duration: 4000 },
];

export function ConnectAccountProgress() {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const startNextTimer = (index: number) => {
      if (index >= PHASES.length - 1) return;
      
      timer = setTimeout(() => {
        setCurrentPhaseIndex(index + 1);
        startNextTimer(index + 1);
      }, PHASES[index].duration);
    };

    startNextTimer(0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center">
      {/* Visual glowing center icon */}
      <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 animate-pulse">
        <Terminal className="w-8 h-8 text-accent animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-accent/5 filter blur-md animate-ping" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight text-text-primary">
          Connecting Your MT5 Account
        </h3>
        <p className="text-sm text-text-secondary max-w-xs mx-auto">
          Please keep this modal open while we securely establish the connection.
        </p>
      </div>

      {/* Indeterminate premium pulse bar */}
      <div className="w-full max-w-sm h-1.5 bg-bg-tertiary rounded-full overflow-hidden relative border border-border-primary/50">
        <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full animate-[shimmer_1.5s_infinite]" 
             style={{
               animation: 'shimmer 1.5s infinite linear'
             }}
        />
      </div>

      {/* Terminal-themed progress phases */}
      <div className="w-full max-w-xs p-4 rounded-xl border border-border-primary bg-bg-tertiary/40 backdrop-blur-md space-y-3.5 text-left font-mono">
        {PHASES.map((phase, index) => {
          const isCompleted = index < currentPhaseIndex;
          const isActive = index === currentPhaseIndex;
          const isPending = index > currentPhaseIndex;

          return (
            <div
              key={phase.id}
              className={`flex items-center space-x-3 text-xs transition-all duration-300 ${
                isActive
                  ? "text-accent font-medium translate-x-1"
                  : isCompleted
                  ? "text-text-primary"
                  : "text-text-secondary/60"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 transition-transform duration-300 scale-110" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-text-secondary/30 shrink-0" />
              )}
              <span className="flex-1 tracking-wide">{phase.label}</span>
              {isActive && (
                <span className="text-[10px] bg-accent/15 px-1.5 py-0.5 rounded text-accent animate-pulse">
                  ACTIVE
                </span>
              )}
            </div>
          );
        })}
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
