"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Settings2 } from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);

function generateBars() {
  return HOURS.map((hour, index) => {
    const base = Math.sin(index * 0.55) * 12000;
    const drift = (index % 5) * 850;
    return { hour, value: Math.round(base + drift) };
  });
}

export function JournalTimePerformanceWidget() {
  const [mode, setMode] = useState<"hourly" | "daily">("hourly");
  const bars = useMemo(generateBars, []);
  const maxAbs = Math.max(...bars.map((bar) => Math.abs(bar.value)), 1);

  return (
    <section className="rounded-xl bg-card-bg ring-1 ring-border-primary/60">
      <header className="border-b border-border-primary/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">
            Trade Time Performance
          </h3>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-secondary">
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setMode("hourly")}
            className={cn(
              "pb-2 text-sm",
              mode === "hourly"
                ? "border-b-2 border-(--calendar-selected-ring) font-semibold text-(--calendar-selected-ring)"
                : "text-text-secondary",
            )}
          >
            Hourly
          </button>
          <button
            onClick={() => setMode("daily")}
            className={cn(
              "pb-2 text-sm",
              mode === "daily"
                ? "border-b-2 border-(--calendar-selected-ring) font-semibold text-(--calendar-selected-ring)"
                : "text-text-secondary",
            )}
          >
            Daily
          </button>
        </div>
      </header>

      <div className="px-4 pb-5 pt-4">
        <div className="grid grid-cols-24 items-end gap-2">
          {bars.map((bar) => {
            const height = Math.max(12, (Math.abs(bar.value) / maxAbs) * 150);
            const positive = bar.value >= 0;
            return (
              <div key={bar.hour} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-3 rounded-sm",
                    positive ? "bg-success" : "bg-danger",
                  )}
                  style={{ height }}
                />
                <span className="text-[0.62rem] text-text-tertiary">{bar.hour}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

