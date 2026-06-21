import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center border border-border-primary bg-card-bg px-6 text-center ${
        compact ? "min-h-44 rounded-md py-8" : "min-h-72 rounded-lg py-12"
      }`}
    >
      <div className="flex size-10 items-center justify-center rounded-md bg-bg-tertiary text-text-secondary">
        <Icon className="size-4" />
      </div>
      <h3 className="mt-4 font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-text-secondary">
        {body}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
