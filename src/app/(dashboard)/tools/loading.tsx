export default function Loading() {
  return (
    <div className="p-4 pb-20 md:p-8 md:pb-8 space-y-6">
      <div className="h-12 w-48 animate-pulse rounded-lg bg-bg-tertiary" />
      <div className="flex gap-2 overflow-x-hidden">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-bg-tertiary" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-bg-tertiary" />
        ))}
      </div>
    </div>
  );
}
