import type { ReactNode } from "react";
import type {
  AutomationHealth,
  CopyRoute,
  CopyTradingConnection,
  TelegramSource,
} from "./types";
import { CopySafetyBar } from "./copy-safety-bar";
import { Tooltip } from "radix-ui";

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
  accounts: CopyTradingConnection[];
  routes: CopyRoute[];
  sources: TelegramSource[];
  onPauseChange: (paused: boolean) => Promise<void>;
}) {
  return (
    <Tooltip.Provider delayDuration={200}>
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
        <div className="pt-6">{children}</div>
      </div>
    </Tooltip.Provider>
  );
}
