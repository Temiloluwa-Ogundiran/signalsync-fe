"use client";

import React from "react";
import { Database, ShieldCheck, RefreshCw } from "lucide-react";
import type { CSVPreviewResponse } from "../../types";

interface CSVConfirmStepProps {
  preview: CSVPreviewResponse;
  displayName: string;
  isPending: boolean;
  reimportAccountName?: string | null;
}

export function CSVConfirmStep({
  preview,
  displayName,
  isPending,
  reimportAccountName,
}: CSVConfirmStepProps) {
  const { trade_count } = preview;

  return (
    <div className="space-y-6">
      {/* Final Summary Card */}
      <div className="rounded-2xl border border-border-primary bg-bg-secondary/40 p-6 text-center space-y-4 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-light text-success mx-auto">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-text-primary">
            Ready to Ingest Trade History
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            You are importing trade history into your Synctrades journal.
          </p>
        </div>

        <div className="border-t border-border-primary/60 pt-4 flex justify-around text-left">
          <div className="space-y-0.5">
            <span className="text-[10px] text-text-tertiary uppercaser block font-bold">
              Account Name
            </span>
            <span className="text-sm font-bold text-text-primary">
              {reimportAccountName || displayName}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-text-tertiary uppercaser block font-bold">
              Trades To Scan
            </span>
            <span className="text-sm font-bold text-text-primary tabular-nums">
              {trade_count}
            </span>
          </div>
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-4 rounded-xl border border-border-primary bg-bg-secondary/20 p-4">
        <h4 className="text-xs font-bold text-text-secondary uppercaser">
          Import Guidelines
        </h4>
        
        <div className="space-y-3.5">
          {/* Rules 1: Duplicate check */}
          <div className="flex items-start gap-3">
            <Database className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <h5 className="text-xs font-semibold text-text-primary">
                Smart Deduplication
              </h5>
              <p className="text-xs text-text-secondary leading-relaxed">
                Position IDs are checked on upload. If you import this file again, duplicate trades are skipped and no duplicate entries are created.
              </p>
            </div>
          </div>

          {/* Rules 2: Daily stats */}
          <div className="flex items-start gap-3">
            <RefreshCw className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <h5 className="text-xs font-semibold text-text-primary">
                Analytics Rebuild
              </h5>
              <p className="text-xs text-text-secondary leading-relaxed">
                Synctrades will recalculate your daily statistics, calendar metrics, and equity curve based on the newly imported history.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay/Progress inside Step */}
      {isPending && (
        <div className="flex flex-col items-center justify-center p-4 gap-2 text-text-secondary">
          <RefreshCw className="h-6 w-6 animate-spin text-brand" />
          <span className="text-xs font-bold">Writing trades to database, building daily analytics...</span>
        </div>
      )}
    </div>
  );
}
