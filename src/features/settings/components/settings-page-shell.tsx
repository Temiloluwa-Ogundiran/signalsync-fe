import type { ReactNode } from "react";

/**
 * Shared chrome for the Settings sub-pages: consistent page padding, a centered
 * narrow column, and a title/description header.
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
    <div className="min-h-[calc(100vh-4rem)] bg-bg-primary px-4 pb-10 pt-6 lg:px-6 font-sans text-text-primary">
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
