export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 shrink-0 animate-pulse rounded-full bg-bg-tertiary" />
        <div className="space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-bg-tertiary" />
          <div className="h-4 w-24 animate-pulse rounded bg-bg-tertiary" />
        </div>
      </div>
      <div className="flex gap-1 border-b border-border-primary pb-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded bg-bg-tertiary" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-bg-tertiary" />
        ))}
      </div>
    </div>
  );
}
