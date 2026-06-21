import type { ReactNode } from "react";
import type {
  AutomationHealth,
  CopyRoute,
  CopyTargetAccount,
  TelegramSource,
} from "./types";
import { CopySafetyBar } from "./copy-safety-bar";

export function CopyTradingShell({
  children,
  health,
  isPaused,
  isUpdating,
  accounts,
  routes,
  sources,
  onPauseChange,
}: {
  children: ReactNode;
  health: AutomationHealth;
  isPaused: boolean;
  isUpdating: boolean;
  accounts: CopyTargetAccount[];
  routes: CopyRoute[];
  sources: TelegramSource[];
  onPauseChange: (paused: boolean) => Promise<void>;
}) {
  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <CopySafetyBar
        health={health}
        isPaused={isPaused}
        isUpdating={isUpdating}
        accounts={accounts}
        routes={routes}
        sources={sources}
        onPauseChange={onPauseChange}
      />
      <main className="pt-6">{children}</main>
    </div>
  );
}
