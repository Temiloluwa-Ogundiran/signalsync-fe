import { HugeiconsIcon } from "@hugeicons/react";
import { Notebook01Icon } from "@hugeicons/core-free-icons";

export default function DiaryPage() {
  return (
    <div className="min-w-0 p-4 pb-24 font-sans md:p-8 md:pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-text-primary md:text-[26px]">
          Diary
        </h1>
      </div>

      <div className="mt-8 flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-border-primary/60 bg-kpi-card-bg p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-white/[0.04] text-text-secondary">
          <HugeiconsIcon icon={Notebook01Icon} size={24} strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-text-primary">
            Your diary is empty
          </p>
          <p className="max-w-sm text-sm text-text-secondary">
            Diary entries will appear here. This view is coming soon — track
            your mindset, setups, and post-trade reviews alongside your journal.
          </p>
        </div>
      </div>
    </div>
  );
}
