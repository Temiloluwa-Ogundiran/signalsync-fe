export default function Loading() {
  return (
    <div className="space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
      <div className="h-12 max-w-2xl animate-pulse rounded-lg bg-bg-tertiary" />
      <div className="h-28 animate-pulse rounded-xl bg-bg-tertiary" />
      <div className="grid gap-4 xl:grid-cols-[1fr_31%]">
        <div className="min-h-[320px] animate-pulse rounded-xl bg-bg-tertiary" />
        <div className="min-h-[200px] animate-pulse rounded-xl bg-bg-tertiary" />
      </div>
    </div>
  );
}
