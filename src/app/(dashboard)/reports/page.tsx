import { HugeiconsIcon } from "@hugeicons/react";
import { AnalyticsUpIcon } from "@hugeicons/core-free-icons";

export default function ReportsPage() {
  return (
    <div className="min-w-0 p-4 pb-24 font-sans md:p-8 md:pb-8">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Performance</p>
        <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-text-primary md:text-[28px]">
          Reports
        </h1>
        <p className="mt-2 text-sm text-text-secondary">Build a clear view of your trading process over time.</p>

      <div className="mt-10 flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-border-primary bg-card-bg p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg bg-accent-light text-accent">
          <HugeiconsIcon icon={AnalyticsUpIcon} size={24} strokeWidth={1.5} />
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
    </div>
  );
}
