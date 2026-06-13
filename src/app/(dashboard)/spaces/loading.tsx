export default function Loading() {
  return (
    <div className="p-4 pb-20 md:p-8 md:pb-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="h-12 w-64 animate-pulse rounded-lg bg-bg-tertiary" />
        <div className="h-10 w-48 animate-pulse rounded-xl bg-bg-tertiary" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-bg-tertiary" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-bg-tertiary" />
        ))}
      </div>
    </div>
  );
}
