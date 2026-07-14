import { Gauge, TriangleAlert } from "lucide-react";
import type { CopyExecutionLatency } from "../types";

function duration(value: number | null) {
  if (value === null) return "No data";
  return value < 1000 ? `${value} ms` : `${(value / 1000).toFixed(2)} s`;
}

export function LatencyStrip({ latency }: { latency?: CopyExecutionLatency }) {
  const healthy = latency?.p95_ms != null && latency.p95_ms <= (latency.target_ms ?? 2000);
  return (
    <section className="flex flex-col gap-4 border-y border-border-primary py-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Copy execution speed">
      <div className="flex items-start gap-3">
        {healthy ? (
          <Gauge aria-hidden="true" className="mt-0.5 size-5 text-success" />
        ) : (
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 text-warning" />
        )}
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Execution speed</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            {latency?.sample_count
              ? `${latency.over_target_count} of ${latency.sample_count} recent instructions exceeded 2 seconds.`
              : "Timing begins with the next copied instruction."}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-6 text-right">
        {[["Typical", latency?.p50_ms ?? null], ["95%", latency?.p95_ms ?? null], ["Slowest 1%", latency?.p99_ms ?? null]].map(([label, value]) => (
          <div key={String(label)}>
            <dt className="text-xs text-text-tertiary">{label}</dt>
            <dd className="mt-1 text-sm font-semibold text-text-primary">{duration(value as number | null)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
