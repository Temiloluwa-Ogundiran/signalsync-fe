// Trade-history table skeleton — §2.3.
export default function Loading() {
  return (
    <div className="space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
      <div className="h-10 max-w-sm animate-pulse rounded-lg bg-bg-tertiary" />
      <div className="flex gap-2">
        <div className="h-9 w-32 animate-pulse rounded-lg bg-bg-tertiary" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-bg-tertiary" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-lg bg-bg-tertiary"
          />
        ))}
      </div>
    </div>
  );
}
