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
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
