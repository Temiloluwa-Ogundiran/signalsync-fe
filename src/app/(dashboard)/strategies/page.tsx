import { HugeiconsIcon } from "@hugeicons/react";
import { StrategyIcon } from "@hugeicons/core-free-icons";

export const metadata = { title: "Strategies" };

export default function StrategiesPage() {
  return (
    <div className="min-w-0 p-4 pb-24 font-sans md:p-8 md:pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-text-primary md:text-[26px]">
          Strategies
        </h1>
      </div>

      <div className="mt-8 flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-border-primary/60 bg-kpi-card-bg p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-white/[0.04] text-text-secondary">
          <HugeiconsIcon icon={StrategyIcon} size={24} strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-text-primary">
            No strategies yet
          </p>
          <p className="max-w-sm text-sm text-text-secondary">
            Define and track your trading strategies here — tag trades to a
            strategy and measure which ones actually work.
          </p>
        </div>
      </div>
    </div>
  );
}
