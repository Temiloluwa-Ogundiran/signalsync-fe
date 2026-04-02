import { cn } from "@/lib/utils";
import type { JournalKpiItem } from "../types";

interface JournalKpiStripProps {
  items: JournalKpiItem[];
}

function Gauge({ ratio = 0 }: { ratio?: number }) {
  const safeRatio = Math.max(0, Math.min(1, ratio));
  const greenSweep = Math.round(safeRatio * 180);
  return (
    <div
      className="h-14 w-14 rounded-full"
      style={{
        background: `conic-gradient(var(--success) 0deg ${greenSweep}deg, var(--danger) ${greenSweep}deg 220deg, rgba(82,82,82,0.5) 220deg 360deg)`,
      }}
    >
      <div className="m-[0.42rem] h-10 w-10 rounded-full bg-card-bg" />
    </div>
  );
}

export function JournalKpiStrip({ items }: JournalKpiStripProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-xl bg-card-bg px-4 py-3 shadow-sm ring-1 ring-border-primary/60"
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <p className="text-xs font-semibold text-text-secondary">{item.label}</p>
            {typeof item.ratio === "number" ? <Gauge ratio={item.ratio} /> : null}
          </div>
          <p
            className={cn(
              "font-heading text-3xl font-bold tracking-tight",
              item.tone === "win" && "text-success",
              item.tone === "loss" && "text-danger",
              item.tone === "default" && "text-text-primary",
            )}
          >
            {item.value}
          </p>
          {item.helper ? (
            <p className="mt-1 text-xs text-text-tertiary">{item.helper}</p>
          ) : null}
        </article>
      ))}
    </section>
  );
}

