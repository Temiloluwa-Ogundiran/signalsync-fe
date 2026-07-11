import { HugeiconsIcon } from "@hugeicons/react";
import { FlaskConicalIcon } from "@hugeicons/core-free-icons";

export const metadata = { title: "Backtesting" };

export default function BacktestingPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-6 font-sans md:p-10">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-lg border border-border-secondary bg-card-bg">
          <HugeiconsIcon
            icon={FlaskConicalIcon}
            size={26}
            strokeWidth={1.5}
            className="text-ai-accent-bright"
          />
        </div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Backtesting
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          This workspace is not available yet.
        </p>
      </div>
    </div>
  );
}
