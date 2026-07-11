import { HugeiconsIcon } from "@hugeicons/react";
import { Notebook01Icon } from "@hugeicons/core-free-icons";

export const metadata = { title: "Notebook" };

export default function NotebookPage() {
  return (
    <div className="min-w-0 p-4 pb-24 font-sans md:p-8 md:pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight text-text-primary md:text-[26px]">
          Notebook
        </h1>
      </div>

      <div className="mt-8 flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-lg border border-border-primary bg-kpi-card-bg p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-subtle text-text-secondary">
          <HugeiconsIcon icon={Notebook01Icon} size={24} strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-text-primary">
            Your notebook is empty
          </p>
          <p className="max-w-sm text-sm text-text-secondary">
            Free-form notes and playbooks will live here — capture ideas,
            rules, and reflections beyond your day-by-day journal.
          </p>
        </div>
      </div>
    </div>
  );
}
