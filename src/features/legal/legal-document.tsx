import type { ReactNode } from "react";

export function LegalDocument({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-sm font-medium text-ai-accent">TradePartna</p>
      <h1 className="mt-3 text-3xl font-bold tracking-normal text-text-primary sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-text-secondary">Last updated: {updatedAt}</p>
      <div className="mt-10 space-y-9 text-base leading-7 text-text-secondary">{children}</div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={title.toLowerCase().replaceAll(" ", "-")}>
      <h2
        id={title.toLowerCase().replaceAll(" ", "-")}
        className="text-xl font-semibold text-text-primary"
      >
        {title}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}
