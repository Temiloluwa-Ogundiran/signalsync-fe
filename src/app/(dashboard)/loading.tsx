// Default route-group fallback (App Router renders this during suspense on
// navigation). Any dashboard route without its own loading.tsx paints this
// skeleton instantly instead of a blank screen — §2.3.
export default function Loading() {
  return (
    <div className="space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
      <div className="h-10 max-w-md animate-pulse rounded-lg bg-bg-tertiary" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-bg-tertiary"
          />
        ))}
      </div>
      <div className="min-h-[360px] animate-pulse rounded-xl bg-bg-tertiary" />
    </div>
  );
}
