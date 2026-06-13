export default function Loading() {
  return (
    <div className="space-y-6 p-4 pb-20 md:p-8 md:pb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="h-14 w-72 animate-pulse rounded-xl bg-bg-tertiary" />
        <div className="h-14 w-48 animate-pulse rounded-xl bg-bg-tertiary" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-bg-tertiary" />
        ))}
      </div>
      <div className="min-h-[500px] animate-pulse rounded-2xl bg-bg-tertiary" />
    </div>
  );
}
