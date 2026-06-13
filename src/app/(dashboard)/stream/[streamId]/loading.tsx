export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-4 py-3 border-b border-border-primary">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-bg-tertiary" />
      </div>
      <div className="h-36 animate-pulse bg-bg-tertiary" />
      <div className="px-4 pt-12 pb-4 space-y-3 border-b border-border-primary">
        <div className="h-6 w-48 animate-pulse rounded bg-bg-tertiary" />
        <div className="h-4 w-32 animate-pulse rounded bg-bg-tertiary" />
      </div>
      <div className="px-4 py-3 border-b border-border-primary">
        <div className="h-20 animate-pulse rounded-xl bg-bg-tertiary" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-4 py-4 border-b border-border-primary flex gap-3">
          <div className="w-10 h-10 shrink-0 animate-pulse rounded-full bg-bg-tertiary" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-bg-tertiary" />
            <div className="h-12 animate-pulse rounded bg-bg-tertiary" />
          </div>
        </div>
      ))}
    </div>
  );
}
