"use client";

import { useEffect, useState } from "react";

export interface ChartColors {
  win: string;
  loss: string;
  ai: string;
  aiBright: string;
  grid: string;
  axisTick: string;
  text: string;
}

const FALLBACK: ChartColors = {
  win: "#14b97c", // --green (chart stroke shade)
  loss: "#e5484a", // --red
  ai: "#6b5bf2",
  aiBright: "#5847e8",
  grid: "rgba(127,127,127,0.12)",
  axisTick: "#8b95a2",
  text: "#14181d",
};

function read(): ChartColors {
  if (typeof document === "undefined") return FALLBACK;
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fb: string) =>
    s.getPropertyValue(name).trim() || fb;
  return {
    // Charts use the brighter ramp shade (--green/--red), not the text shade.
    win: v("--green", FALLBACK.win),
    loss: v("--red", FALLBACK.loss),
    ai: v("--ai-accent", FALLBACK.ai),
    aiBright: v("--ai-accent-bright", FALLBACK.aiBright),
    grid: v("--hairline", FALLBACK.grid),
    axisTick: v("--text-tertiary", FALLBACK.axisTick),
    text: v("--text-primary", FALLBACK.text),
  };
}

/**
 * Resolve chart colors from the active theme's CSS variables. Recharts needs
 * concrete color strings (not Tailwind classes), so we read the computed
 * variables and re-derive whenever the theme flips — observed via the `.dark`
 * class on <html> (no feature dependency). Replaces the per-file
 * `const WIN = "#22C55E"` etc. that don't adapt to light mode.
 */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(FALLBACK);

  useEffect(() => {
    const sync = () => setColors(read());
    // Defer the first read off the synchronous effect body.
    const raf = requestAnimationFrame(sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return colors;
}
