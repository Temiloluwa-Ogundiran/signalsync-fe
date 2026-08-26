import { HugeiconsIcon } from "@hugeicons/react";
import { Notebook01Icon } from "@hugeicons/core-free-icons";

export const metadata = { title: "Notebook" };

export default function NotebookPage() {
  return (
    <div className="min-w-0 p-4 pb-24 font-sans md:p-8 md:pb-8">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Reflection</p>
        <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-text-primary md:text-[28px]">
          Notebook
        </h1>
        <p className="mt-2 text-sm text-text-secondary">Keep the rules, ideas, and observations behind your trades.</p>

      <div className="mt-10 flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-border-primary bg-card-bg p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg bg-accent-light text-accent">
          <HugeiconsIcon icon={Notebook01Icon} size={24} strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-text-primary">
            Your notebook is empty
          </p>
          <p className="max-w-sm text-sm text-text-secondary">
            Free-form notes and playbooks will live here. Capture ideas,
            rules, and reflections beyond your day-by-day journal.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
