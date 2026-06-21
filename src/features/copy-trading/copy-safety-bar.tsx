"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CircleCheck,
  CirclePause,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  AutomationHealth,
  CopyRoute,
  CopyTargetAccount,
  TelegramSource,
} from "./types";
import { EmergencyActionsDialog } from "./emergency-actions-dialog";

const icons = {
  success: CircleCheck,
  warning: AlertTriangle,
  neutral: CirclePause,
  danger: ShieldAlert,
};

const toneClass = {
  success: "text-success",
  warning: "text-warning-text",
  neutral: "text-text-secondary",
  danger: "text-danger",
};

export function CopySafetyBar({
  health,
  isPaused,
  isUpdating,
  accounts,
  routes,
  sources,
  onPauseChange,
}: {
  health: AutomationHealth;
  isPaused: boolean;
  isUpdating: boolean;
  accounts: CopyTargetAccount[];
  routes: CopyRoute[];
  sources: TelegramSource[];
  onPauseChange: (enabled: boolean) => Promise<void>;
}) {
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const Icon = icons[health.tone];

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-border-primary py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Icon className={`mt-0.5 size-4 shrink-0 ${toneClass[health.tone]}`} />
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {health.label}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-text-secondary">
              {health.description}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isUpdating}
            onClick={() => onPauseChange(isPaused)}
          >
            {isPaused ? "Resume copying" : "Pause copying"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEmergencyOpen(true)}
          >
            Emergency actions
          </Button>
        </div>
      </div>
      <EmergencyActionsDialog
        open={emergencyOpen}
        onOpenChange={setEmergencyOpen}
        accounts={accounts}
        routes={routes}
        sources={sources}
      />
    </>
  );
}
