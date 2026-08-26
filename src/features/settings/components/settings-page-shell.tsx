import type { ReactNode } from "react";

/**
 * Shared chrome for the Settings sub-pages: matches the dashboard/journal canvas
 * (no own background — the page paints onto the shell's bg-bg-canvas/bg-bg-primary
 * main), consistent journal-style padding, a centered column, and a header.
 */
export function SettingsPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="p-4 pb-20 font-sans text-text-primary md:p-8 md:pb-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="border-b border-border-primary pb-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Settings
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
