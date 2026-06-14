export default function Loading() {
  return (
    <div className="min-w-0 space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
      <div className="h-12 max-w-2xl animate-pulse rounded-lg bg-bg-tertiary" />
      <div className="h-28 animate-pulse rounded-xl bg-bg-tertiary" />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
        <div className="min-h-[320px] animate-pulse rounded-xl bg-bg-tertiary" />
        <div className="min-h-[200px] animate-pulse rounded-xl bg-bg-tertiary" />
      </div>
    </div>
  );
}
