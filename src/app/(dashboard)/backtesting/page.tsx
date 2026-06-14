import { HugeiconsIcon } from "@hugeicons/react";
import {
  FlaskConicalIcon,
  Bookmark02Icon,
  Rocket01Icon,
  ChartLineData01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

export const metadata = { title: "Backtesting" };

const PREVIEW = [
  {
    icon: Bookmark02Icon,
    title: "Strategies",
    desc: "Save and version your trading strategies.",
  },
  {
    icon: Rocket01Icon,
    title: "New backtest",
    desc: "Run a strategy across historical data.",
  },
  {
    icon: ChartLineData01Icon,
    title: "Results",
    desc: "Equity curves, win rate, drawdown, expectancy.",
  },
  {
    icon: Clock01Icon,
    title: "History",
    desc: "Revisit and compare past runs.",
  },
];

export default function BacktestingPage() {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden p-6 font-sans md:p-10">
      {/* Soft ambient glow behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.18), rgba(139,92,246,0) 70%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
        {/* Icon medallion */}
        <div className="relative mb-6 flex size-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl opacity-50"
            style={{
              background:
                "linear-gradient(135deg, rgba(167,139,250,0.18), rgba(139,92,246,0) 60%)",
            }}
          />
          <HugeiconsIcon
            icon={FlaskConicalIcon}
            size={30}
            strokeWidth={1.5}
            className="relative text-ai-accent-bright"
          />
        </div>

        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          <span className="size-1.5 rounded-full bg-ai-accent-bright" />
          Coming soon
        </span>

        <h1 className="text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
          Backtesting
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-text-secondary">
          Test your strategies against real historical market data before you
          risk a dollar. Measure edge, refine, and trade with conviction.
        </p>

        {/* Feature preview */}
        <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {PREVIEW.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-text-secondary">
                <HugeiconsIcon icon={f.icon} size={18} strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">
                  {f.title}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-text-tertiary">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[13px] text-text-tertiary">
          We&rsquo;re building this now — it&rsquo;ll land in your sidebar when
          it&rsquo;s ready.
        </p>
      </div>
    </div>
  );
}
