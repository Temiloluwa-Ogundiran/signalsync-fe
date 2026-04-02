export function JournalSymbolsWidget() {
  return (
    <section className="rounded-xl bg-card-bg ring-1 ring-border-primary/60">
      <header className="flex items-center justify-between border-b border-border-primary/60 px-4 py-3">
        <h3 className="text-base font-semibold text-text-primary">Symbols Traded</h3>
        <button className="rounded-full border border-border-primary px-3 py-1 text-sm font-semibold text-text-primary">
          All Symbols (2)
        </button>
      </header>
      <div className="flex items-center justify-center p-6">
        <div className="h-72 w-72 rounded-full bg-[conic-gradient(var(--success)_0deg_310deg,var(--danger)_310deg_360deg)]" />
      </div>
    </section>
  );
}

