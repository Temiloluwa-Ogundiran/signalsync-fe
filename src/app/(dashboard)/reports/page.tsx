import { HugeiconsIcon } from "@hugeicons/react";
import { ChartBarLineIcon } from "@hugeicons/core-free-icons";

export default function ReportsPage() {
  return (
    <div className="min-w-0 p-4 pb-24 font-sans md:p-8 md:pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-text-primary md:text-[26px]">
          Reports
        </h1>
      </div>

      <div className="mt-8 flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-border-primary/60 bg-kpi-card-bg p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-white/[0.04] text-text-secondary">
          <HugeiconsIcon icon={ChartBarLineIcon} size={24} strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-text-primary">
            No reports yet
          </p>
          <p className="max-w-sm text-sm text-text-secondary">
            Performance reports will appear here. This view is coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
