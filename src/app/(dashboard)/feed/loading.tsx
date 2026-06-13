// Feed post-stream skeleton — §2.3.
export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
      <div className="h-10 w-full animate-pulse rounded-lg bg-bg-tertiary" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl bg-bg-tertiary/40 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-bg-tertiary" />
            <div className="h-4 w-32 animate-pulse rounded bg-bg-tertiary" />
          </div>
          <div className="h-20 animate-pulse rounded-lg bg-bg-tertiary" />
        </div>
      ))}
    </div>
  );
}
